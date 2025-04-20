from fastapi import FastAPI, HTTPException
from models import Product, Bill, BillItem, UserLogin
from database import product_collection, bill_collection, user_collection
from fastapi import Query
from typing import Optional
from datetime import datetime

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

# Bill Management
@app.post("/bills/")
def create_bill(bill: Bill):
    bill_dict = bill.dict()
    result = bill_collection.insert_one(bill_dict)
    return {"message": "Bill saved", "id": str(result.inserted_id)}

@app.get("/bills/")
def get_bills(
    min_total: Optional[float] = Query(None),
    max_total: Optional[float] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 10
):
    filters = {}

    if min_total or max_total:
        filters["grandTotal"] = {}
        if min_total:
            filters["grandTotal"]["$gte"] = min_total
        if max_total:
            filters["grandTotal"]["$lte"] = max_total

    if start_date or end_date:
        filters["timestamp"] = {}
        if start_date:
            filters["timestamp"]["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            filters["timestamp"]["$lte"] = datetime.fromisoformat(end_date)

    bills = list(bill_collection.find(filters, {"_id": 0}).skip(skip).limit(limit))
    return bills


@app.post("/login/")
def login(user: UserLogin):
    db_user = user_collection.find_one({"username": user.username})
    
    if not db_user or user.password != db_user["password"]:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {"message": "Login successful", "username": db_user["username"]}

@app.post("/users/")
def create_user(user: UserLogin):
    if user_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")

    user_collection.insert_one(user.dict())
    return {"message": "User created successfully", "username": user.username}