#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed May 28 12:39:44 2025

@author: utkarsh
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import sys
from dateutil import parser

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://user123:1234@scholarshipfinder.juuzsrz.mongodb.net/?retryWrites=true&w=majority&appName=scholarshipfinder"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

db = client["scholarship_db"]
collection = db["scholarship_info"]
# Setup options
chrome_options = Options()
#chrome_options.add_argument("--headless")  # Optional: remove this if you want to see the browser
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

# Path to your ChromeDriver (update path as needed)
service = Service("/opt/homebrew/bin/chromedriver")  # <-- Change this to your correct path
driver = webdriver.Chrome(service=service, options=chrome_options)

# Load the page
driver.get("https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-type/academic-scholarships-and-merit-scholarships")

# Wait for scholarships to load
try:
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.CLASS_NAME, "award-box"))
    )
except Exception as e:
    print(f"Error waiting for page to load: {e}")
    driver.quit()
    sys.exit()

# Extract scholarships
cards = driver.find_elements(By.CLASS_NAME, "award-box")
print(f"Found {len(cards)} scholarship cards")
scholarships = []
for card in cards:  # limit to first 5
    try:
        name = card.find_element(By.TAG_NAME, "h2").text.strip()
        amount_elem = card.find_element(By.XPATH, ".//em[text()='Amount']/following-sibling::span")
        amount = amount_elem.text.strip()
        dead_elem = card.find_element(By.XPATH,".//em[text()='Deadline']/following-sibling::span")
        deadline = dead_elem.text.strip()
        parsed_date = parser.parse(deadline);
        cons_dead = parsed_date.strftime("%d-%m-%Y")
        link = card.find_element(By.TAG_NAME, "a").get_attribute("href")
        full_link = "https://www.scholarships.com" + link if link.startswith("/") else link
        scholarships.append({
            "name":name,
            "award":amount,
            "deadline":cons_dead,
            "eligibility":"None",
            "link":full_link
            })
        print(f"\n📚 {name}\n💵 {amount}\n⏳ {cons_dead} \n🔗 {full_link}")
    except Exception as e:
        print(f" Error extracting card: {e}")

driver.quit()

collection.insert_many(scholarships)