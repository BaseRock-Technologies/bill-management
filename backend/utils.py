from pymongo.collection import ReturnDocument
from database import db  # assuming db = client["your_db"]

def get_next_product_code():
    counter = db["counters"].find_one_and_update(
        {"_id": "product_code"},
        {"$inc": {"sequence_value": 1}},
        return_document=ReturnDocument.AFTER,
        upsert=True
    )

    number = counter["sequence_value"]
    return f"P{number:04d}"  # Formats like P0001, P0012