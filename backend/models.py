from pydantic import BaseModel, Field
from typing import Optional

class Product(BaseModel):
    product_id: str = Field(..., example="P001")
    product_name: str = Field(..., example="Wireless Mouse")
    gst_percentage: Optional[float] = Field(None, example=18.0)
    price: float = Field(..., example=499.99)
    quantity: Optional[int] = Field(0, example=100)

class BillItem(BaseModel):
    product_id: str
    quantity: int