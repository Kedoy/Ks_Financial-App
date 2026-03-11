# Быстрый старт

## Требования

- Python 3.10+
- Node.js 18+
- PostgreSQL (опционально, для продакшена)

## 1. Установка бэкенда

### Клонирование репозитория

```bash
git clone https://github.com/avekedoy/Ks_Financial-App.git
cd Ks_Financial-App
```

### Создание виртуального окружения

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
```

### Установка зависимостей

```bash
pip install -r requirements.txt
```

### Настройка базы данных

**Вариант 1: SQLite (для разработки)**

```bash
python manage.py migrate
python manage.py createsuperuser
```

**Вариант 2: PostgreSQL (Docker)**

```bash
docker-compose up -d postgres
python manage.py migrate
```

### Запуск сервера

```bash
python manage.py runserver 0.0.0.0:8000
```

## 2. Установка фронтенда

### Установка зависимостей

```bash
cd my-finance-app
npm install
```

### Запуск development сервера

```bash
npm run dev
```

## 3. Проверка работы

Откройте **http://localhost:5173**

**Тестовые учётные данные:**
- Email: `admin@admin.com`
- Пароль: `admin123`

## 4. Настройка окружения

### Бэкенд (.env)

Скопируйте `.env.example` в `.env`:

```bash
cd backend
cp .env.example .env
```

Отредактируйте `.env`:

```env
# Django settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database (для PostgreSQL)
POSTGRES_DB=fin_db
POSTGRES_USER=fin_user
POSTGRES_PASSWORD=fin_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# JWT
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=15
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173

# OpenRouter AI API
OPENROUTER_API_KEY=sk-or-v1-your-key-here
AI_MODEL=arcee-ai/trinity-mini:free
```

### Фронтенд (.env)

Создайте `.env` в `my-finance-app/`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## 5. Создание тестовых данных

```bash
cd backend
python manage.py shell
```

```python
from apps.accounts.models import User
from apps.transactions.models import Transaction
from apps.categories.models import Category
from django.utils import timezone

# Создать пользователя
user = User.objects.create_user(
    email='test@example.com',
    password='test123',
    username='testuser'
)

# Создать категории
food = Category.objects.create(name='Еда', type='expense', is_system=True)
salary = Category.objects.create(name='Зарплата', type='income', is_system=True)

# Создать транзакции
Transaction.objects.create(
    user=user,
    type='expense',
    amount=1500,
    category=food,
    description='Обед в кафе',
    date=timezone.now()
)

Transaction.objects.create(
    user=user,
    type='income',
    amount=50000,
    category=salary,
    description='Зарплата',
    date=timezone.now()
)
```

## 6. Проверка API

### Аутентификация

```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'
```

### Получение транзакций

```bash
curl http://localhost:8000/api/v1/transactions/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### AI Рекомендации

```bash
curl "http://localhost:8000/api/v1/analytics/ai-insights/?days=30" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 7. Генерация документации

```bash
pip install -r docs-requirements.txt
mkdocs serve
```

Откройте **http://localhost:8008**

## 8. Запуск тестов

```bash
cd backend
pytest
pytest --cov=apps --cov-report=html
```

## Возможные проблемы

### Ошибка CORS

Убедитесь, что в `settings.py`:

```python
CORS_ALLOWED_ORIGINS = ['http://localhost:5173']
CORS_ALLOW_CREDENTIALS = True
```

### Ошибка подключения к БД

Проверьте `.env` и запустите PostgreSQL:

```bash
docker-compose ps
```

### Порт занят

```bash
lsof -i :8000  # Найти процесс
kill -9 PID    # Убить процесс
```

## Следующие шаги

- 📖 Изучите [архитектуру](architecture.md)
- 🔐 Настройте [безопасность](security/auth.md)
- 🤖 Настройте [AI сервисы](backend/ai-services.md)
- 🚀 Разверните в [production](deployment/production.md)
