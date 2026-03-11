# Бэкенд (Django)

## Обзор

Бэкенд приложения построен на **Django REST Framework** и предоставляет REST API для веб и мобильных клиентов.

### Структура приложений

```
backend/apps/
├── accounts/         # Пользователи, аутентификация, профили
├── transactions/     # Транзакции, SMS-парсинг
├── categories/       # Категории доходов/расходов
├── analytics/        # AI-аналитика, рекомендации
├── blog/             # Мини-блог, посты, комментарии
└── core/             # Общие сервисы, исключения
```

## Основные модели данных

### User (apps/accounts/models.py)

```python
class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'  # Email вместо username
```

### Profile (apps/accounts/models.py)

```python
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='avatars/%Y/%m/')
    bio = models.TextField(max_length=500)
    currency = models.CharField(max_length=3, default='RUB')
```

### Transaction (apps/transactions/models.py)

```python
class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    source = models.CharField(max_length=10, choices=SOURCE_TYPES, default='manual')
    is_ai_parsed = models.BooleanField(default=False)
    date = models.DateTimeField()
```

### Category (apps/categories/models.py)

```python
class Category(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    icon = models.CharField(max_length=50, default='default')
    color = models.CharField(max_length=7, default='#3498db')
    user = models.ForeignKey(User, null=True, blank=True)
    is_system = models.BooleanField(default=False)
```

### Post (apps/blog/models.py)

```python
class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES)
    image = models.ImageField(upload_to='posts/images/', null=True)
    likes = models.PositiveIntegerField(default=0)
```

## API Endpoints

### Аутентификация

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/v1/auth/login/` | Вход (JWT токены) |
| POST | `/api/v1/auth/logout/` | Выход |
| POST | `/api/v1/auth/register/` | Регистрация |
| POST | `/api/v1/auth/refresh/` | Обновление токена |
| GET | `/api/v1/auth/me/` | Текущий пользователь |
| PUT | `/api/v1/auth/profile/` | Обновление профиля |

### Транзакции

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/transactions/` | Список транзакций |
| POST | `/api/v1/transactions/` | Создать транзакцию |
| GET | `/api/v1/transactions/{id}/` | Детали транзакции |
| PUT | `/api/v1/transactions/{id}/` | Обновить транзакцию |
| DELETE | `/api/v1/transactions/{id}/` | Удалить транзакцию |
| POST | `/api/v1/transactions/sms-parse/` | Парсинг SMS |
| GET | `/api/v1/transactions/stats/daily/` | Статистика по дням |
| GET | `/api/v1/transactions/stats/monthly/` | Статистика по месяцам |

### Категории

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/categories/` | Список категорий |
| POST | `/api/v1/categories/` | Создать категорию |
| PUT | `/api/v1/categories/{id}/` | Обновить категорию |
| DELETE | `/api/v1/categories/{id}/` | Удалить категорию |
| GET | `/api/v1/categories/system/` | Системные категории |

### Аналитика

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/analytics/summary/` | Общая сводка |
| GET | `/api/v1/analytics/daily/` | Дневные тренды |
| GET | `/api/v1/analytics/monthly/` | Месячные тренды |
| GET | `/api/v1/analytics/ai-insights/` | AI рекомендации |

### Блог

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/blog/posts/` | Лента постов |
| POST | `/api/v1/blog/posts/` | Создать пост |
| GET | `/api/v1/blog/posts/{id}/` | Детали поста |
| PUT | `/api/v1/blog/posts/{id}/` | Обновить пост |
| DELETE | `/api/v1/blog/posts/{id}/` | Удалить пост |
| POST | `/api/v1/blog/posts/{id}/like/` | Лайк поста |
| POST | `/api/v1/blog/posts/{id}/add_comment/` | Добавить комментарий |

## Сервисы

### SMS Parser (apps/transactions/services/sms_parser.py)

Парсинг SMS от банков:

```python
from apps.transactions.services.sms_parser import parse_sms

parsed = parse_sms(
    sms_text="Pokupka 1500.00 RUB. Karta *1234. Magazit 'Produkti'",
    bank_phone="900"
)
# Returns: {
#   'amount': 1500.00,
#   'type': 'expense',
#   'category': 'Продукты',
#   'description': "Magazit 'Produkti'"
# }
```

**Поддерживаемые банки:**
- Сбербанк (900)
- Тинькофф
- Альфа-Банк

### Category Suggester (apps/transactions/services/category_suggester.py)

Автоматическая категоризация:

```python
from apps.transactions.services.category_suggester import suggest_category

category = suggest_category(
    description="Обед в ресторане",
    transaction_type="expense"
)
# Returns: Category object (Кафе и рестораны)
```

**Метод работает на основе:**
- Ключевых слов для каждой категории
- Типа транзакции (income/expense)

### OpenRouter Service (apps/core/services/openrouter_service.py)

AI анализ финансовых данных:

```python
from apps.core.services.openrouter_service import openrouter_service

insights = openrouter_service.analyze_financial_data({
    'period_days': 30,
    'total_expenses': 40000,
    'total_income': 100000,
    'balance': 60000,
    'expense_count': 15,
    'income_count': 3,
    'top_categories': [
        {'name': 'Аренда', 'total': 20000},
        {'name': 'Еда', 'total': 10000}
    ]
})
# Returns: [
#   {'category': 'Сбережения', 'insight': '...', 'type': 'success'},
#   {'category': 'Транспорт', 'insight': '...', 'type': 'info'}
# ]
```

**Алгоритм работы:**
1. Сбор финансовых данных
2. Генерация промпта для ИИ
3. Запрос к OpenRouter API
4. Парсинг JSON ответа
5. Нормализация рекомендаций
6. Кэширование результата

## Управление

### Миграции

```bash
python manage.py makemigrations
python manage.py migrate
```

### Создание суперпользователя

```bash
python manage.py createsuperuser
```

### Сбор статики

```bash
python manage.py collectstatic
```

### Тестирование

```bash
pytest
pytest --cov=apps
pytest --cov-report=html
```

## Настройки

### Базовые (config/settings/base.py)

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    
    # Local
    'apps.accounts',
    'apps.transactions',
    'apps.categories',
    'apps.analytics',
    'apps.blog',
    'apps.core',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

### Переменные окружения

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True

# Database
POSTGRES_DB=fin_db
POSTGRES_USER=fin_user
POSTGRES_PASSWORD=fin_password

# JWT
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=15
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173

# AI
OPENROUTER_API_KEY=sk-or-v1-...
AI_MODEL=arcee-ai/trinity-mini:free
```

## Docker

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: fin_db
      POSTGRES_USER: fin_user
      POSTGRES_PASSWORD: fin_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  web:
    build: .
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://fin_user:fin_password@postgres:5432/fin_db

volumes:
  postgres_data:
```

### Запуск

```bash
docker-compose up -d
docker-compose logs -f web
```
