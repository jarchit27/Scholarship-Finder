#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed May 28 18:08:25 2025

@author: utkarsh
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import sys
import time
from dateutil import parser
from datetime import datetime, timedelta
import re


# Setup options
chrome_options = Options()
#chrome_options.add_argument("--headless")  # Optional: remove this if you want to see the browser
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

# Path to your ChromeDriver (update path as needed)
service = Service("/opt/homebrew/bin/chromedriver")  # <-- Change this to your correct path
driver = webdriver.Chrome(service=service, options=chrome_options)

# Load the page
scholarships = []
urls = ["https://www.buddy4study.com/scholarships","https://www.buddy4study.com/scholarships?&page=2", "https://www.buddy4study.com/open-scholarships","https://www.buddy4study.com/open-scholarships?&page=2"]
for url in urls:
    print(url)
    print("\n\n")
    driver.get(url)
    # Wait for scholarships to load
    time.sleep(5)
    
    # Extract scholarships
    cards = driver.find_elements(By.CLASS_NAME,"Listing_categoriesBox__CiGvQ")
    print(f"Found {len(cards)} scholarship cards")
    
    for card in cards:
        try:
            name = card.find_element(By.CLASS_NAME, "Listing_scholarshipName__VLFMj").text.strip()
            containers = driver.find_elements(By.CLASS_NAME, "Listing_awardCont__qnjQK")
            amount = containers[0].find_element(By.TAG_NAME,"p").text.strip()
            eligibility = containers[1].find_element(By.TAG_NAME,"p").text.strip()
            #amount_elem = card.find_element(By.CLASS_NAME, "Listing_rightAward__DxMQV")
            #amount = amount_elem.find_element(By.TAG_NAME,"p").text.strip()
            if(url == urls[2] or url==urls[3]):
                cons_dead = "Always"
                
            
            else:
                dead_elem = card.find_element(By.CLASS_NAME, "Listing_daystoGo__mTJ17")
                deadline = dead_elem.text.strip()
                match = re.search(r"(\d+)\s+days?\s+to\s+go", deadline.lower())
                match2 = re.search(r"Last\s+day\s+to\s+go", deadline.lower())
                if match:
                    days = int(match.group(1))
                    future_date = datetime.today() + timedelta(days=days)
                    cons_dead = future_date.strftime("%d-%m-%Y")
                    #print("Deadline:", deadline)
                elif match2:
                    days = 0
                    future_date = datetime.today() + timedelta(days=days)
                    cons_dead = future_date.strftime("%d-%m-%Y")
                elif deadline == "closed":
                    continue
                else :
                    parsed_date = parser.parse(deadline);
                    cons_dead = parsed_date.strftime("%d-%m-%Y")
            #eligibility = 
            #parsed_date = parser.parse(deadline);
            #cons_dead = parsed_date.strftime("%d-%m-%Y")
            #apply_link = card.find_element(By.CSS_SELECTOR, "div[class*='learn-more-button']")
            link = card.get_attribute("href")
            full_link = "https://www.scholarships.com" + link if link.startswith("/") else link
            scholarships.append({
                "name":name,
                "award":amount,
                "deadline":cons_dead,
                "eligibility":eligibility,
                "link":full_link
                })
            print(f"\n📚 {name}\n💵 {amount}\n⏳ {cons_dead}\n✅ {eligibility} \n🔗 {link}")
        except Exception as e:
            print(f" Error extracting card: {e}")
    
driver.quit()

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

collection.insert_many(scholarships)
