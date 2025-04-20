from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os

load_dotenv()

uri = os.getenv('MONGO_URI')

try:
    if "mongodb" in uri:
        client = MongoClient(uri, server_api=ServerApi('1'))
    else:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)

    client.admin.command('ping')
    print("✅ Successfully connected to MongoDB!")
except Exception as e:
    print("❌ MongoDB connection failed!")
    print(f"Error: {e}")
    raise

# Get or create the 'bill-management' database
db = client["bill-management"]

# Define required collections
required_collections = ["products", "bills", "users"]

# Get existing collection names
existing_collections = db.list_collection_names()

# Create collections if they don't exist
for coll in required_collections:
    if coll not in existing_collections:
        db.create_collection(coll)
        print(f"✅ Created missing collection: {coll}")

# Collections
product_collection = db.products
bill_collection = db.bills
user_collection = db.users
