from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TransactionBase(BaseModel):
    amount: float
    description: Optional[str] = None
    category_id: Optional[int] = None
    type: str = "expense"  # "expense" или "income"
    date: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    type: Optional[str] = None
    date: Optional[datetime] = None

class Transaction(TransactionBase):
    id: int
    user_id: int
    source: str = "manual"
    created_at: datetime
    
    class Config:
        from_attributes = True