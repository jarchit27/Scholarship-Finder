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
    """
    Try to parse a scholarship deadline string into a date object.
    Returns None on failure.
    (Not used in final_score by default, but kept for future use.)
    """
    if not date_str or not date_str.strip():
        return None
    try:
        dt = dateparser.parse(date_str, dayfirst=False)
        return dt.date()
    except Exception:
        return None


def extract_numeric_amount(award_str):
    """
    Extract the largest integer (or float→int) from an award string.
    Returns 0 if nothing parseable.
    (Included for reference; not used in final_score by default.)
    """
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
    """
    Convert a deadline into urgency ∈ [0..1]:
      If parsed_date < today: return 0.0
      Else: return 1/(days_left + 1).
    (Included for reference; not used in final_score by default.)
    """
    d = parse_date(deadline_str)
    if d is None:
        return 0.0

    today = date.today()
    delta = (d - today).days
    if delta < 0:
        return 0.0
    return 1.0 / (delta + 1)  # today ⇒ 1.0, tomorrow ⇒ 0.5, etc.


def compute_textblob_vader(text, vader_analyzer):
    """
    Compute a “sentiment” score in [0..1] by blending:
      - TextBlob polarity ∈ [–1..+1]
      - VADER compound ∈ [–1..+1]
    If text is empty, returns 0.5 (neutral).
    """
    if not text:
        return 0.5

    blob_polarity = TextBlob(text).sentiment.polarity                # [–1..+1]
    vader_compound = vader_analyzer.polarity_scores(text)["compound"] # [–1..+1]
    raw_blend = (blob_polarity + vader_compound) / 2.0                # [–1..+1]
    return (raw_blend + 1.0) / 2.0   # rescale to [0..1]


def normalize_cgpa(cgpa_str):
    """
    Convert CGPA string (e.g. “8.4”) to a float ∈ [0..1] by dividing by MAX_CGPA.
    Returns 0.0 on parse failure or empty string.
    """
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
    """
    1) Fetch user by email from MongoDB.
    2) Extract profile: address, gender, qualification, institution, CGPA.
    3) Fetch all scholarships; for each:
       a) Combine name + award + eligibility → combined_text
       b) Compute six sub‐scores ∈ [0..1]:
          1) sentiment_score     (TextBlob+VADER on combined_text)
          2) address_score       (token‐overlap between user_address & scholarship address/eligibility)
          3) gender_score        (1.0 if eligibility contains user’s gender as a whole word)
          4) cgpa_score          (normalized CGPA, boosted to 1.0 if “cgpa ≥ X” requirement is met)
          5) qualification_score (1.0 if eligibility contains user’s qualification substring)
          6) institution_score   (1.0 if eligibility contains user’s institution substring)
       c) final_score = weighted sum of those six factors → ∈ [0..1].
    4) Return scholarships sorted by descending final_score.
    """

    # 1) Connect to MongoDB
    client   = MongoClient(MONGO_URI, server_api=ServerApi("1"))
    db       = client[DB_NAME]
    users    = db[USERS_COLL]
    sch_coll = db[SCHOLARS_COLL]

    # 2) Fetch the user document
    user = users.find_one({"email": user_email})
    if not user:
        client.close()
        return []

    # 3) Extract and lowercase profile fields
    user_address_raw   = user.get("address", "").strip().lower()      # e.g. "assam, india"
    user_gender        = user.get("gender", "").strip().lower()       # e.g. "male" or "female"
    edu = user.get("education", {})
    user_qualification = edu.get("qualification", "").strip().lower()  # e.g. "b.tech"
    user_institution   = edu.get("institution", "").strip().lower()    # e.g. "iit guwahati"
    user_cgpa_norm     = normalize_cgpa(edu.get("scoreValue", "").strip())

    # 4) Load all scholarships (for optional amount)
    all_schols = list(sch_coll.find({}))
    if not all_schols:
        client.close()
        return []

    raw_amounts = [extract_numeric_amount(s.get("award", "")) for s in all_schols]
    max_amount  = max(raw_amounts) if raw_amounts else 0

    # 5) Instantiate VADER
    vader_analyzer = SentimentIntensityAnalyzer()

    scored_list = []
    for idx, sch in enumerate(all_schols):
        # 5a) Lowercase scholarship fields for substring/regex
        sch_name        = sch.get("name", "").strip()
        sch_award       = sch.get("award", "").strip()
        sch_deadline    = sch.get("deadline", "").strip()    # not used by default
        sch_eligibility = sch.get("eligibility", "").strip()
        sch_address_raw = sch.get("address", "").strip().lower()  # optional

        # Build combined_text for sentiment
        combined_text = " ".join([sch_name, sch_award, sch_eligibility]).strip()

        # 5b1) TEXTBLOB + VADER sentiment ∈ [0..1]
        sentiment_score = compute_textblob_vader(combined_text, vader_analyzer)

        # 5b2) ADDRESS MATCH: tokens in user_address_raw & (sch_address_raw + eligibility)
        addr_tokens_user = set(user_address_raw.split())
        sch_address_text = " ".join([sch_address_raw, sch_eligibility.lower()])
        addr_tokens_sch  = set(sch_address_text.split())
        if addr_tokens_user:
            shared_addr   = addr_tokens_user.intersection(addr_tokens_sch)
            address_score = len(shared_addr) / float(len(addr_tokens_user))
        else:
            address_score = 0.0

        # 5b3) GENDER MATCH: whole‐word (so “male” ≠ “female”)
        gender_score = 0.0
        if user_gender:
            pattern = r"\b" + re.escape(user_gender) + r"\b"
            if re.search(pattern, sch_eligibility.lower()):
                gender_score = 1.0

        # 5b4) CGPA MATCH: look for “cgpa ≥ X” in eligibility
        cgpa_score = user_cgpa_norm
        if sch_eligibility:
            m = re.search(r"cgpa\s*[≥>=]*\s*([\d\.]+)", sch_eligibility.lower())
            if m:
                try:
                    required     = float(m.group(1))
                    required_norm= min(max(required / MAX_CGPA, 0.0), 1.0)
                    if user_cgpa_norm >= required_norm:
                        cgpa_score = 1.0
                    else:
                        if required_norm > 0:
                            cgpa_score = min(user_cgpa_norm / required_norm, 1.0)
                except ValueError:
                    pass

        # 5b5) QUALIFICATION MATCH: 1.0 if substring appears
        qualification_score = 0.0
        if user_qualification and (user_qualification in sch_eligibility.lower()):
            qualification_score = 1.0

        # 5b6) INSTITUTION MATCH: 1.0 if substring appears
        institution_score = 0.0
        if user_institution and (user_institution in sch_eligibility.lower()):
            institution_score = 1.0

        # 5c & 5d) (OPTIONAL) urgency & amount, not used by default
        urgency_score = 0.0
        amount_score  = (raw_amounts[idx] / max_amount) if max_amount > 0 else 0.0

        # 5e) FINAL SCORE = weighted sum of six sub‐scores
        final_score = (
            WEIGHT_SENTIMENT       * sentiment_score
          + WEIGHT_ADDRESS_MATCH   * address_score
          + WEIGHT_GENDER_MATCH    * gender_score
          + WEIGHT_CGPA_MATCH      * cgpa_score
          + WEIGHT_QUALIFICATION   * qualification_score
          + WEIGHT_INSTITUTE_MATCH * institution_score
          # To re‐introduce urgency & amount, uncomment below and adjust weights:
          # + WEIGHT_URGENCY      * urgency_score
          # + WEIGHT_AMOUNT       * amount_score
        )

        # Attach sub‐scores & final_score for debugging
        sch["__sub_scores"] = {
            "sentiment":     round(sentiment_score,     4),
            "address":       round(address_score,       4),
            "gender":        round(gender_score,        4),
            "cgpa":          round(cgpa_score,          4),
            "qualification": round(qualification_score, 4),
            "institution":   round(institution_score,   4),
            # "urgency":       round(urgency_score,       4),  # if enabled
            # "amount":        round(amount_score,        4)   # if enabled
        }
        sch["final_score"] = round(final_score, 4)

        scored_list.append(sch)

    # 6) Sort by descending final_score
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

    # Print top 5 scholarships as JSON
    top_n = 5
    output = []
    for sch in ranked[:top_n]:
        output.append({
            "name":        sch.get("name", "<no name>"),
            "award":       sch.get("award", ""),
            "eligibility": sch.get("eligibility", ""),
            "link":        sch.get("link", ""),
            "deadline":    sch.get("deadline", ""),
            "final_score": sch["final_score"],
            "details":     sch["__sub_scores"]
        })

    print(json.dumps(output, indent=2))
