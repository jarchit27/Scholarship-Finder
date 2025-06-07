#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json
import re
import os
from datetime import date
from dateutil import parser as dateparser

from pymongo import MongoClient
from pymongo.server_api import ServerApi

from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# ---------------------------------------------
#  CONFIGURATION (adjust as necessary)
# ---------------------------------------------
MONGO_URI     = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://user123:1234@scholarshipfinder.juuzsrz.mongodb.net/"
    "?retryWrites=true&w=majority&appName=scholarshipfinder"
)
DB_NAME       = os.environ.get("DB_NAME", "scholarship_db")
USERS_COLL    = "users"
SCHOLARS_COLL = "scholarship_info"

# Weights for combining sub‐scores into final_score.
WEIGHT_SENTIMENT      = 1.0 / 6.0   # ~0.1667
WEIGHT_ADDRESS_MATCH  = 1.0 / 6.0
WEIGHT_GENDER_MATCH   = 1.0 / 6.0
WEIGHT_CGPA_MATCH     = 1.0 / 6.0
WEIGHT_QUALIFICATION  = 1.0 / 6.0
WEIGHT_INSTITUTE_MATCH= 1.0 / 6.0

MAX_CGPA = 10.0  # Adjust if your CGPA scale differs


# ---------------------------------------------
#  UTILITY FUNCTIONS
# ---------------------------------------------

def parse_date(date_str):
    if not date_str or not date_str.strip():
        return None
    try:
        dt = dateparser.parse(date_str, dayfirst=False)
        return dt.date()
    except Exception:
        return None


def extract_numeric_amount(award_str):
    if not award_str or not award_str.strip():
        return 0
    matches = re.findall(r"[\d\.,]+", award_str)
    numeric_values = []
    for m in matches:
        cleaned = m.replace(",", "").strip()
        try:
            val = float(cleaned)
            numeric_values.append(int(val))
        except ValueError:
            continue
    return max(numeric_values) if numeric_values else 0


def compute_deadline_urgency(deadline_str):
    d = parse_date(deadline_str)
    if d is None:
        return 0.0
    today = date.today()
    delta = (d - today).days
    if delta < 0:
        return 0.0
    return 1.0 / (delta + 1)


def compute_textblob_vader(text, vader_analyzer):
    if not text:
        return 0.5
    blob_polarity = TextBlob(text).sentiment.polarity
    vader_compound = vader_analyzer.polarity_scores(text)["compound"]
    raw_blend = (blob_polarity + vader_compound) / 2.0
    return (raw_blend + 1.0) / 2.0


def normalize_cgpa(cgpa_str):
    if not cgpa_str:
        return 0.0
    try:
        raw = float(cgpa_str)
        return min(max(raw / MAX_CGPA, 0.0), 1.0)
    except ValueError:
        return 0.0


# ---------------------------------------------
#  MAIN RANKING FUNCTION
# ---------------------------------------------

def rank_scholarships_for_user(user_email):
    client   = MongoClient(MONGO_URI, server_api=ServerApi("1"))
    db       = client[DB_NAME]
    users    = db[USERS_COLL]
    sch_coll = db[SCHOLARS_COLL]

    user = users.find_one({"email": user_email})
    if not user:
        client.close()
        return []

    user_address_raw   = user.get("address", "").strip().lower()
    user_gender        = user.get("gender", "").strip().lower()
    edu = user.get("education", {})
    user_qualification = edu.get("qualification", "").strip().lower()
    user_institution   = edu.get("institution", "").strip().lower()
    user_cgpa_norm     = normalize_cgpa(edu.get("scoreValue", "").strip())

    all_schols = list(sch_coll.find({}))
    if not all_schols:
        client.close()
        return []

    raw_amounts = [extract_numeric_amount(s.get("award", "")) for s in all_schols]
    max_amount  = max(raw_amounts) if raw_amounts else 0
    vader_analyzer = SentimentIntensityAnalyzer()

    scored_list = []
    for idx, sch in enumerate(all_schols):
        sch_name        = sch.get("name", "").strip()
        sch_award       = sch.get("award", "").strip()
        sch_eligibility = sch.get("eligibility", "").strip()
        sch_address_raw = sch.get("address", "").strip().lower()

        combined_text = " ".join([sch_name, sch_award, sch_eligibility]).strip()
        sentiment_score = compute_textblob_vader(combined_text, vader_analyzer)

        addr_tokens_user = set(user_address_raw.split())
        sch_tokens = set((sch_address_raw + " " + sch_eligibility.lower()).split())
        address_score = len(addr_tokens_user & sch_tokens) / float(len(addr_tokens_user)) if addr_tokens_user else 0.0

        gender_score = 1.0 if user_gender and re.search(r"\b" + re.escape(user_gender) + r"\b", sch_eligibility.lower()) else 0.0

        cgpa_score = user_cgpa_norm
        m = re.search(r"cgpa\s*[≥>=]*\s*([\d\.]+)", sch_eligibility.lower())
        if m:
            try:
                required = float(m.group(1))
                req_norm = min(max(required / MAX_CGPA, 0.0), 1.0)
                cgpa_score = 1.0 if user_cgpa_norm >= req_norm else min(user_cgpa_norm / req_norm, 1.0)
            except ValueError:
                pass

        qualification_score = 1.0 if user_qualification and (user_qualification in sch_eligibility.lower()) else 0.0
        institution_score = 1.0 if user_institution and (user_institution in sch_eligibility.lower()) else 0.0

        final_score = (
            WEIGHT_SENTIMENT       * sentiment_score +
            WEIGHT_ADDRESS_MATCH   * address_score +
            WEIGHT_GENDER_MATCH    * gender_score +
            WEIGHT_CGPA_MATCH      * cgpa_score +
            WEIGHT_QUALIFICATION   * qualification_score +
            WEIGHT_INSTITUTE_MATCH * institution_score
        )

        sch["__sub_scores"] = {
            "sentiment":     round(sentiment_score,     4),
            "address":       round(address_score,       4),
            "gender":        round(gender_score,        4),
            "cgpa":          round(cgpa_score,          4),
            "qualification": round(qualification_score, 4),
            "institution":   round(institution_score,   4)
        }
        sch["final_score"] = round(final_score, 4)
        scored_list.append(sch)

    scored_list.sort(key=lambda d: d["final_score"], reverse=True)
    client.close()
    return scored_list


# ---------------------------------------------
#  SCRIPT ENTRY POINT
# ---------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Email not provided"}))
        sys.exit(1)

    user_email = sys.argv[1].strip()
    ranked = rank_scholarships_for_user(user_email)

    output = []
    for sch in ranked:
        output.append({
            "name":        sch.get("name", "<no name>"),
            "award":       sch.get("award", ""),
            "eligibility": sch.get("eligibility", ""),
            "link":        sch.get("link", ""),
            "deadline":    sch.get("deadline", ""),
            "final_score": sch["final_score"],
            "details":     sch.get("__sub_scores", {})
        })

    print(json.dumps(output, indent=2))
