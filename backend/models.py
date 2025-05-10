from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Product(BaseModel):
    id: str = Field(..., example="P001")
    code: Optional[str] = Field(..., example="P001")
    name: str = Field(..., example="Wireless Mouse")
    gstPercentage: Optional[float] = Field(None, example=18.0)
    price: float = Field(..., example=499.99)
    quantity: Optional[int] = Field(0, example=100)
    unit: Optional[str] = Field(..., example='kg')

class BillItem(BaseModel):
    id: str
    code: str
    name: str
    unit: str
    price: float
    gstPercentage: Optional[float] = 0.0
    quantity: Optional[int] = 0
    billQuantity: int
    discount: Optional[float] = 0.0
    total: float
    gstAmount: float

class Bill(BaseModel):
    id: str
    items: List[BillItem]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    subtotal: float
    totalGst: float
    totalCGst: float
    totalSGst: float
    totalDiscount: float
    grandTotal: float
    
class UserLogin(BaseModel):
    username: str
    password: str