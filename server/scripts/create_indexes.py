"""
Database index management for MongoDB.
Run this script once to create optimized indexes for better query performance.

Usage:
    python -m server.scripts.create_indexes
"""
import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set in .env")
    sys.exit(1)

client = MongoClient(DATABASE_URL)
db = client[os.getenv("MONGO_DB_NAME", "ecommerce")]

INDEXES = {
    "products": [
        {"keys": [("slug", 1)], "options": {"unique": True, "sparse": True}},
        {"keys": [("isDraft", 1)]},
        {"keys": [("category", 1)]},
        {"keys": [("categories", 1)]},
        {"keys": [("categories.name", 1)]},
        {"keys": [("categories.slug", 1)]},
        {"keys": [("name", "text"), ("description", "text")]},
        {"keys": [("price", 1)]},
        {"keys": [("stock", 1)]},
        {"keys": [("createdAt", -1)]},
        {"keys": [("ratings", -1)]},
    ],
    "categories": [
        {"keys": [("slug", 1)], "options": {"unique": True, "sparse": True}},
        {"keys": [("name", 1)]},
        {"keys": [("parent", 1)]},
    ],
    "orders": [
        {"keys": [("userId", 1)]},
        {"keys": [("status", 1)]},
        {"keys": [("createdAt", -1)]},
        {"keys": [("orderNumber", 1)], "options": {"unique": True}},
    ],
    "carts": [
        {"keys": [("userId", 1)], "options": {"unique": True}},
        {"keys": [("guestId", 1)], "options": {"unique": True, "sparse": True}},
        {"keys": [("updatedAt", 1)], "options": {"expireAfterSeconds": 2592000}},
    ],
    "users": [
        {"keys": [("email", 1)], "options": {"unique": True}},
        {"keys": [("username", 1)], "options": {"unique": True, "sparse": True}},
    ],
    "wishlist": [
        {"keys": [("userId", 1), ("productId", 1)]},
    ],
    "newsletter_subscriptions": [
        {"keys": [("email", 1)], "options": {"unique": True}},
        {"keys": [("createdAt", 1)]},
    ],
}


def create_indexes():
    print("Starting database index optimization...")
    total_created = 0

    for collection_name, index_list in INDEXES.items():
        try:
            collection = db[collection_name]
            print(f"\nCollection: {collection_name}")

            for index_spec in index_list:
                keys = index_spec["keys"]
                options = index_spec.get("options", {})
                result = collection.create_index(keys, **options)
                print(f"  Created index: {result}")
                total_created += 1

        except Exception as e:
            print(f"  Error creating indexes: {e}")

    print(f"\nCompleted. Created {total_created} indexes.")


def list_indexes():
    print("\nExisting Indexes:")
    for collection_name in INDEXES.keys():
        try:
            collection = db[collection_name]
            indexes = collection.list_indexes()
            print(f"\n{collection_name}:")
            for index in indexes:
                print(f"  - {index['name']}: {index['key']}")
        except Exception as e:
            print(f"  Error: {e}")


if __name__ == "__main__":
    try:
        client.admin.command("ping")
        print("Connected to MongoDB\n")
        create_indexes()
        list_indexes()
        print("\nDatabase optimization complete.")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        client.close()
