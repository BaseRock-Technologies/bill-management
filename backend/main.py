from fastapi import FastAPI, HTTPException
from models import Product
from database import product_collection
from bson import ObjectId
from fastapi import Query
from typing import Optional

app = FastAPI()

# Create product
@app.post("/products/")
def create_product(product: Product):
    if product_collection.find_one({"product_id": product.product_id}):
        raise HTTPException(status_code=400, detail="Product ID already exists")
    product_dict = product.dict()
    result = product_collection.insert_one(product_dict)
    return {"message": "Product created", "id": str(result.inserted_id)}

# Read all products
@app.get("/all_products/")
def get_all_products():
    products = list(product_collection.find({}, {"_id": 0}))
    return products

# Read single product
@app.get("/products/{product_id}")
def get_product(product_id: str):
    product = product_collection.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Update product
@app.put("/products/{product_id}")
def update_product(product_id: str, updated_product: Product):
    result = product_collection.update_one(
        {"product_id": product_id},
        {"$set": updated_product.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated"}

# Delete product
@app.delete("/products/{product_id}")
def delete_product(product_id: str):
    result = product_collection.delete_one({"product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# Get filtered products
@app.get("/products/")
def get_products(
    q: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    skip: int = 0,
    limit: int = 10
):
    filters = {}

    if q:
        filters["product_name"] = {"$regex": q, "$options": "i"}  # case-insensitive
    if min_price is not None or max_price is not None:
        filters["price"] = {}
        if min_price is not None:
            filters["price"]["$gte"] = min_price
        if max_price is not None:
            filters["price"]["$lte"] = max_price

    products = list(product_collection.find(filters, {"_id": 0}).skip(skip).limit(limit))
    return products
