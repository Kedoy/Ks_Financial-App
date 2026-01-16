from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import Transaction
from app.schemas import TransactionCreate, TransactionUpdate
from datetime import datetime, timedelta

def get_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Получить транзакции пользователя"""
    return db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).order_by(desc(Transaction.date)).offset(skip).limit(limit).all()

def get_transaction(db: Session, transaction_id: int, user_id: int):
    """Получить конкретную транзакцию"""
    return db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == user_id
    ).first()

def create_transaction(db: Session, transaction: TransactionCreate, user_id: int):
    """Создать транзакцию"""
    db_transaction = Transaction(**transaction.dict(), user_id=user_id)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def update_transaction(db: Session, transaction_id: int, transaction: TransactionUpdate, user_id: int):
    """Обновить транзакцию"""
    db_transaction = get_transaction(db, transaction_id, user_id)
    if not db_transaction:
        return None
    
    update_data = transaction.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_transaction, field, value)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def delete_transaction(db: Session, transaction_id: int, user_id: int):
    """Удалить транзакцию"""
    db_transaction = get_transaction(db, transaction_id, user_id)
    if not db_transaction:
        return False
    
    db.delete(db_transaction)
    db.commit()
    return True

def get_transactions_by_date_range(db: Session, user_id: int, start_date: datetime, end_date: datetime):
    """Получить транзакции за период"""
    return db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).all()