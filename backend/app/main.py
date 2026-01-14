from fastapi import FastAPI, Depends
from app.database import engine
from app.models import Base
from app.api import auth
from app.database import get_db
from sqlalchemy.orm import Session
from app.models import User

# Создаём таблицы (если ещё не созданы)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Financial Assistant API",
    description="API для мобильного финансового помощника",
    version="1.0.0"
)

# Подключаем роутеры
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Financial Assistant API is running!"}

@app.get("/health")
async def health():
    return {"status": "ok", "database": "connected"}

@app.get("/api/v1/test/db")
async def test_db(db: Session = Depends(get_db)):
    """Тестовый эндпоинт для проверки БД"""
    # 1. Посчитать пользователей
    count = db.query(User).count()
    
    # 2. Получить последних 5 пользователей
    users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    
    return {
        "status": "ok",
        "tables": ["users"],
        "user_count": count,
        "recent_users": [
            {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "created_at": user.created_at.isoformat()
            }
            for user in users
        ]
    }