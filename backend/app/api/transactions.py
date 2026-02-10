from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.core.security import verify_token
from app.schemas import Transaction, TransactionCreate, TransactionUpdate
from app.crud_transaction import (
    get_transactions, get_transaction, create_transaction,
    update_transaction, delete_transaction, get_transactions_by_date_range
)
from app.models import User

# Для авторизации
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

router = APIRouter()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Получить текущего пользователя из токена"""
    email = verify_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=List[Transaction])
def read_transactions(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = Query(None, description="Фильтр по категории"),
    start_date: Optional[datetime] = Query(None, description="Начальная дата (формат: 2024-01-15T00:00:00)"),
    end_date: Optional[datetime] = Query(None, description="Конечная дата (формат: 2024-01-15T23:59:59)"),
    type: Optional[str] = Query(None, description="Тип: 'expense' или 'income'"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получить все транзакции пользователя с фильтрами
    
    - **skip**: сколько записей пропустить (для пагинации)
    - **limit**: сколько записей вернуть (макс. 100)
    - **category_id**: фильтр по категории
    - **start_date/end_date**: фильтр по дате
    - **type**: тип транзакции (expense/income)
    """
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    # Применяем фильтры
    if category_id is not None:
        query = query.filter(Transaction.category_id == category_id)
    
    if type is not None:
        query = query.filter(Transaction.type == type)
    
    if start_date is not None:
        query = query.filter(Transaction.date >= start_date)
    
    if end_date is not None:
        query = query.filter(Transaction.date <= end_date)
    
    # Сортировка по дате (сначала новые)
    transactions = query.order_by(desc(Transaction.date)).offset(skip).limit(limit).all()
    return transactions

@router.get("/{transaction_id}", response_model=Transaction)
def read_transaction(
    transaction_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получить конкретную транзакцию по ID
    """
    transaction = get_transaction(db, transaction_id=transaction_id, user_id=current_user.id)
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.post("/", response_model=Transaction, status_code=status.HTTP_201_CREATED)
def create_user_transaction(
    transaction: TransactionCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Создать новую транзакцию
    
    Пример тела запроса:
    ```json
    {
        "amount": 1500.50,
        "description": "Продукты в Магните",
        "category_id": 1,
        "type": "expense",
        "date": "2024-01-15T14:30:00"
    }
    ```
    """
    return create_transaction(db, transaction=transaction, user_id=current_user.id)

@router.put("/{transaction_id}", response_model=Transaction)
def update_user_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Обновить существующую транзакцию
    """
    db_transaction = update_transaction(
        db, 
        transaction_id=transaction_id, 
        transaction=transaction, 
        user_id=current_user.id
    )
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_transaction(
    transaction_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Удалить транзакцию
    """
    success = delete_transaction(db, transaction_id=transaction_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return None

@router.get("/stats/by-category", response_model=dict)
def get_stats_by_category(
    start_date: Optional[datetime] = Query(None, description="Начальная дата"),
    end_date: Optional[datetime] = Query(None, description="Конечная дата"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Статистика расходов по категориям за период
    
    Если даты не указаны — за последние 30 дней
    """
    # По умолчанию: последние 30 дней
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    transactions = get_transactions_by_date_range(
        db, user_id=current_user.id, start_date=start_date, end_date=end_date
    )
    
    # Фильтруем только расходы
    expenses = [t for t in transactions if t.type == "expense"]
    
    # Группируем по категориям
    category_stats = {}
    total_expenses = 0
    
    for t in expenses:
        category_name = t.category.name if t.category else "Без категории"
        if category_name not in category_stats:
            category_stats[category_name] = {"amount": 0, "count": 0, "color": t.category.color if t.category else "#CCCCCC"}
        
        category_stats[category_name]["amount"] += t.amount
        category_stats[category_name]["count"] += 1
        total_expenses += t.amount
    
    # Добавляем проценты
    result = []
    for category_name, stats in category_stats.items():
        percentage = (stats["amount"] / total_expenses * 100) if total_expenses > 0 else 0
        result.append({
            "category": category_name,
            "amount": round(stats["amount"], 2),
            "count": stats["count"],
            "percentage": round(percentage, 1),
            "color": stats["color"]
        })
    
    # Сортируем по сумме (убывание)
    result.sort(key=lambda x: x["amount"], reverse=True)
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "total_expenses": round(total_expenses, 2),
        "total_income": round(sum(t.amount for t in transactions if t.type == "income"), 2),
        "balance": round(
            sum(t.amount for t in transactions if t.type == "income") - 
            sum(t.amount for t in transactions if t.type == "expense"), 
            2
        ),
        "by_category": result
    }

@router.get("/stats/monthly", response_model=dict)
def get_monthly_stats(
    months: int = Query(6, ge=1, le=12, description="Количество месяцев для анализа"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Динамика расходов и доходов по месяцам
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 * months)
    
    transactions = get_transactions_by_date_range(
        db, user_id=current_user.id, start_date=start_date, end_date=end_date
    )
    
    # Группируем по месяцам
    monthly_stats = {}
    
    for t in transactions:
        # Ключ: "2024-01"
        month_key = t.date.strftime("%Y-%m")
        
        if month_key not in monthly_stats:
            monthly_stats[month_key] = {
                "expenses": 0,
                "income": 0,
                "balance": 0
            }
        
        if t.type == "expense":
            monthly_stats[month_key]["expenses"] += t.amount
        else:
            monthly_stats[month_key]["income"] += t.amount
        
        monthly_stats[month_key]["balance"] = (
            monthly_stats[month_key]["income"] - monthly_stats[month_key]["expenses"]
        )
    
    # Преобразуем в список для ответа
    result = []
    for month_key, stats in sorted(monthly_stats.items()):
        result.append({
            "month": month_key,
            "expenses": round(stats["expenses"], 2),
            "income": round(stats["income"], 2),
            "balance": round(stats["balance"], 2)
        })
    
    return {
        "period_months": months,
        "monthly_data": result
    }