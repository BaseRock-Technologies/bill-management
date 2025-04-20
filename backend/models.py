from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Product(BaseModel):
    product_id: str = Field(..., example="P001")
    product_name: str = Field(..., example="Wireless Mouse")
    gst_percentage: Optional[float] = Field(None, example=18.0)
    price: float = Field(..., example=499.99)
    quantity: Optional[int] = Field(0, example=100)

class BillItem(BaseModel):
    product_id: str
    product_name: str
    price: float
    gst_percentage: Optional[float] = 0.0
    quantity: Optional[int] = 0
    billQuantity: int
    discount: Optional[float] = 0.0
    total: float
    gstAmount: float

class Bill(BaseModel):
    items: List[BillItem]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    subtotal: float
    totalGst: float
    totalDiscount: float
    grandTotal: float
    
class UserLogin(BaseModel):
    username: str
    password: str