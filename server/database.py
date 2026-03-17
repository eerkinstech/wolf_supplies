"""
MongoDB database initialization
This module is imported by both main.py and other applications
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize MongoDB connection
DATABASE_URL = os.getenv("DATABASE_URL", "mongodb://localhost:27017/ecommerce")
print(f"[DATABASE] Connecting to: {DATABASE_URL}")

client = MongoClient(DATABASE_URL, serverSelectionTimeoutMS=10000)

# Verify connection
try:
    client.admin.command('ping')
    print("[DATABASE] OK Connected to MongoDB successfully")
except Exception as e:
    print(f"[DATABASE] FAIL Failed to connect to MongoDB: {e}")

# Get database and collections
db = client.get_database("ecommerce")
print(f"[DATABASE] OK Using database: {db.name}")

# Export for other modules
__all__ = ['client', 'db']
