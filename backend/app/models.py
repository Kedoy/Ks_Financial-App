from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    categories = relationship("Category", back_populates="owner", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="owner", cascade="all, delete-orphan")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    icon = Column(String, default="default")
    color = Column(String, default="#3498db")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    # Relationships
    owner = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    type = Column(String, default="expense")  # "expense" или "income"
    source = Column(String, default="manual")  # "manual" или "sms"
    
    # Foreign keys
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    # Relationships
    owner = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())