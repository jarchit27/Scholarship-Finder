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
# Note: CATEGORY filter has been removed; weights sum to ≈ 1.0.
WEIGHT_TEXTBLB_VADER    = 0.1667   # blend of TextBlob polarity + VADER compound
WEIGHT_ADDRESS_MATCH    = 0.1111   # geographical/address overlap
WEIGHT_GENDER_MATCH     = 0.1111   # exact gender match (as a whole word)
WEIGHT_CGPA_MATCH       = 0.1667   # normalized CGPA vs eligibility requirement
WEIGHT_QUALIFICATION    = 0.1667   # exact degree/qualification match
WEIGHT_INSTITUTE_MATCH  = 0.1667   # exact institution match
WEIGHT_NOUNPHRASE       = 0.1111   # noun‐phrase overlap between user and eligibility

MAX_CGPA = 10.0  # Adjust if your CGPA scale differs (e.g. 4.0 or 10.0)

# ---------------------------------------------
#  UTILITY FUNCTIONS
# ---------------------------------------------

def parse_date(date_str):
    """
    Try to parse a scholarship deadline string into a date object.
    Returns None on failure.
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
    Extract the largest integer (or float→int) found in the award string.
    Examples:
      "$5,000 per year"   → 5000
      "Up to ₹10,0000"    → 100000
      "€2,500-€5,000"     → 5000
    Returns 0 if nothing parseable.
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
    """
    d = parse_date(deadline_str)
    if d is None:
        return 0.0

    today = date.today()
    delta = (d - today).days
    if delta < 0:
        return 0.0
    return 1.0 / (delta + 1)  # today→1.0, tomorrow→0.5, etc.


def extract_noun_phrases(text):
    """
    Use TextBlob to extract a set of lowercase noun phrases from the given text.
    Returns a Python set of strings.
    """
    if not text or not text.strip():
        return set()
    blob = TextBlob(text.lower())
    return set(phrase.strip() for phrase in blob.noun_phrases)


def compute_textblob_vader(text, vader_analyzer):
    """
    Compute a “sentiment” score in [0..1] by blending:
      - TextBlob polarity ∈ [–1..+1]
      - VADER compound ∈ [–1..+1]
    If text is empty, return 0.5 (neutral).
    """
    if not text:
        return 0.5

    blob_polarity = TextBlob(text).sentiment.polarity               # [–1..+1]
    vader_compound = vader_analyzer.polarity_scores(text)["compound"]  # [–1..+1]
    raw_blend = (blob_polarity + vader_compound) / 2.0               # [–1..+1]
    return (raw_blend + 1.0) / 2.0   # rescale to [0..1]


def normalize_cgpa(cgpa_str):
    """
    Convert CGPA string (e.g. “8.4”) to a float ∈ [0..1] by dividing by MAX_CGPA.
    Returns 0.0 if unparsable or empty.
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
    2) Extract user‐profile fields: address, gender, qualification, institution, CGPA.
    3) Fetch all scholarships. For each scholarship:
       a. Build combined_text = name + award + eligibility.
       b. Compute 7 sub‐scores ∈ [0..1]:
          1) sentiment_score     (TextBlob+VADER on combined_text)
          2) address_score       (token‐overlap between user_address & scholarship address/eligibility)
          3) gender_score        (1.0 if eligibility mentions user’s gender as a whole word)
          4) cgpa_score          (normalized CGPA, boosted to 1.0 if eligibility’s minimum CGPA ≤ user’s CGPA)
          5) qualification_score (1.0 if eligibility mentions user’s qualification substring)
          6) institution_score   (1.0 if eligibility mentions user’s institution substring)
          7) noun_overlap_score  (fraction of user noun phrases appearing in eligibility)
       c. (Optionally) compute amount_score & urgency_score if desired; currently omitted.
       d. Combine sub‐scores with configured weights → final_score ∈ [0..1].
    4) Return the list sorted by descending final_score.
    """

    # 1) Connect to MongoDB
    client = MongoClient(MONGO_URI, server_api=ServerApi("1"))
    db = client[DB_NAME]
    users_coll   = db[USERS_COLL]
    schol_coll   = db[SCHOLARS_COLL]

    # 2) Fetch the user document
    user = users_coll.find_one({"email": user_email})
    if not user:
        client.close()
        return []

    # 3) Extract user‐profile fields (all lowercased for matching)
    user_address_raw   = user.get("address", "").strip().lower()      # e.g. "assam, india"
    user_gender        = user.get("gender", "").strip().lower()       # e.g. "male" or "female"
    edu = user.get("education", {})
    user_qualification = edu.get("qualification", "").strip().lower()  # e.g. "b.tech"
    user_institution   = edu.get("institution", "").strip().lower()    # e.g. "iit guwahati"
    user_cgpa_norm     = normalize_cgpa(edu.get("scoreValue", "").strip())  # ∈ [0..1]

    # Build user_keywords list (for possible optional substring‐based scoring)
    user_keywords = []
    for val in [user_address_raw, user_gender, user_qualification, user_institution]:
        if val:
            user_keywords.append(val)

    # Build user noun phrases from "qualification + institution + address"
    noun_source_text = " ".join([user_qualification, user_institution, user_address_raw])
    user_noun_phrases = extract_noun_phrases(noun_source_text)

    # 4) Pre‐scan scholarships to collect raw amounts (OPTIONAL) and find max_amount
    #    Even if we do not use amount in the final score, we show how to extract it.
    all_schols = list(schol_coll.find({}))
    if not all_schols:
        client.close()
        return []

    raw_amounts = [extract_numeric_amount(s.get("award", "")) for s in all_schols]
    max_amount = max(raw_amounts) if raw_amounts else 0

    # 5) Instantiate VADER once
    vader_analyzer = SentimentIntensityAnalyzer()

    scored_list = []
    for idx, sch in enumerate(all_schols):
        # 5a) Lowercased scholarship fields for easy substring/regex matches
        sch_name         = sch.get("name", "").strip()
        sch_award        = sch.get("award", "").strip()
        sch_deadline     = sch.get("deadline", "").strip()
        sch_eligibility  = sch.get("eligibility", "").strip()
        sch_address_raw  = sch.get("address", "").strip().lower()      # optional field
        # (We dropped scholarship["category"] entirely per your request.)

        # Build combined_text for TextBlob+VADER
        combined_text = " ".join([sch_name, sch_award, sch_eligibility]).strip()

        # 5b1) TEXTBLOB+VADER sentiment score ∈ [0..1]
        sentiment_score = compute_textblob_vader(combined_text, vader_analyzer)

        # 5b2) ADDRESS MATCH: token‐overlap between user_address_raw & (sch_address_raw + eligibility)
        addr_tokens_user = set(user_address_raw.split())
        sch_address_text = " ".join([sch_address_raw, sch_eligibility.lower()])
        addr_tokens_sch  = set(sch_address_text.split())
        if addr_tokens_user:
            shared_addr = addr_tokens_user.intersection(addr_tokens_sch)
            address_score = len(shared_addr) / float(len(addr_tokens_user))
        else:
            address_score = 0.0

        # 5b3) GENDER MATCH: match as a whole word to avoid “male” ⊂ “female”
        gender_score = 0.0
        if user_gender:
            pattern = r"\b" + re.escape(user_gender) + r"\b"
            if re.search(pattern, sch_eligibility.lower()):
                gender_score = 1.0

        # 5b4) CGPA MATCH:
        #    Look for a pattern like “cgpa ≥ X” or “minimum cgpa x” in eligibility.
        #    If found, compare user_cgpa_norm to required_norm.
        #    Otherwise just use user_cgpa_norm as the score.
        cgpa_score = user_cgpa_norm
        if sch_eligibility:
            m = re.search(r"cgpa\s*[≥>=]*\s*([\d\.]+)", sch_eligibility.lower())
            if m:
                try:
                    required = float(m.group(1))
                    required_norm = min(max(required / MAX_CGPA, 0.0), 1.0)
                    if user_cgpa_norm >= required_norm:
                        cgpa_score = 1.0
                    else:
                        # Partial credit
                        if required_norm > 0:
                            cgpa_score = min(user_cgpa_norm / required_norm, 1.0)
                except ValueError:
                    pass

        # 5b5) QUALIFICATION MATCH: 1.0 if eligibility contains user_qualification as a substring
        qualification_score = 0.0
        if user_qualification and (user_qualification in sch_eligibility.lower()):
            qualification_score = 1.0

        # 5b6) INSTITUTION MATCH: 1.0 if eligibility contains user_institution as a substring
        institution_score = 0.0
        if user_institution and (user_institution in sch_eligibility.lower()):
            institution_score = 1.0

        # 5b7) NOUN‐PHRASE OVERLAP between user and scholarship eligibility
        sch_noun_phrases = extract_noun_phrases(sch_eligibility.lower())
        if user_noun_phrases:
            overlap = user_noun_phrases.intersection(sch_noun_phrases)
            noun_overlap_score = len(overlap) / float(len(user_noun_phrases))
        else:
            noun_overlap_score = 0.0

        # 5c) (OPTIONAL) DEADLINE URGENCY [0..1]
        # If you want to include deadline, un-comment the next two lines and add WEIGHT_URGENCY:
        # urgency_score = compute_deadline_urgency(sch_deadline)
        # Otherwise set to 0.0
        urgency_score = 0.0

        # 5d) (OPTIONAL) AMOUNT NORMALIZATION [0..1]
        amount_raw  = raw_amounts[idx]
        amount_score = (amount_raw / max_amount) if max_amount > 0 else 0.0

        # 5e) FINAL SCORE = weighted sum of the seven sub‐scores
        final_score = (
            WEIGHT_TEXTBLB_VADER  * sentiment_score
          + WEIGHT_ADDRESS_MATCH  * address_score
          + WEIGHT_GENDER_MATCH   * gender_score
          + WEIGHT_CGPA_MATCH     * cgpa_score
          + WEIGHT_QUALIFICATION  * qualification_score
          + WEIGHT_INSTITUTE_MATCH* institution_score
          + WEIGHT_NOUNPHRASE     * noun_overlap_score
          # If you want to add urgency & amount, include the lines below:
          # + WEIGHT_URGENCY      * urgency_score
          # + WEIGHT_AMOUNT       * amount_score
        )

        # Attach sub‐scores & final_score back into the scholarship doc
        sch["__sub_scores"] = {
            "sentiment":     round(sentiment_score,     4),
            "address":       round(address_score,       4),
            "gender":        round(gender_score,        4),
            "cgpa":          round(cgpa_score,          4),
            "qualification": round(qualification_score, 4),
            "institution":   round(institution_score,   4),
            "noun_overlap":  round(noun_overlap_score,  4),
            # If you include urgency & amount:
            # "urgency":       round(urgency_score,       4),
            # "amount":        round(amount_score,        4)
        }
        sch["final_score"] = round(final_score, 4)

        scored_list.append(sch)

    # 6) Sort descending by final_score
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
