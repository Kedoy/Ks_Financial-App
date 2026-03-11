# Архитектура проекта

## Общая схема

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Web App   │  │  Android    │  │   Mobile    │             │
│  │   (React)   │  │   (Kotlin)  │  │   (Future)  │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                      │
│         └────────────────┴────────────────┘                      │
│                          │                                       │
│                    HTTP/HTTPS                                    │
│                    JWT Auth                                        │
└──────────────────────────┼───────────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────────┐
│                      API Gateway                                  │
│                  Django REST Framework                            │
├──────────────────────────┼───────────────────────────────────────┤
│                    Application Layer                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Authentication & Authorization (JWT + HttpOnly Cookies) │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ Transactions│ │ Categories  │ │  Analytics  │ │   Blog    │ │
│  │   Service   │ │   Service   │ │   Service   │ │  Service  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│  ┌─────────────┐ ┌─────────────┐                                │
│  │  SMS Parser │ │  AI Service │                                │
│  │   Service   │ │  (OpenRouter)                               │
│  └─────────────┘ └─────────────┘                                │
├─────────────────────────────────────────────────────────────────┤
│                     Data Access Layer                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Django ORM                              │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      Data Layer                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  PostgreSQL │  │   SQLite    │  │    Cache    │             │
│  │ (Production)│  │   (Dev)     │  │  (Redis)    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## Структура проекта

```
Ks_Financial-App/
├── backend/                      # Django REST API
│   ├── apps/
│   │   ├── accounts/            # Пользователи и аутентификация
│   │   │   ├── models.py        # User, Profile
│   │   │   ├── views.py         # Auth views, JWT
│   │   │   ├── serializers.py   # Auth serializers
│   │   │   └── urls.py
│   │   ├── transactions/        # Управление транзакциями
│   │   │   ├── models.py        # Transaction
│   │   │   ├── views.py         # CRUD, SMS parse
│   │   │   ├── serializers.py
│   │   │   ├── services/
│   │   │   │   ├── sms_parser.py       # Парсинг SMS
│   │   │   │   └── category_suggester.py # AI категоризация
│   │   │   └── urls.py
│   │   ├── categories/          # Категории
│   │   │   ├── models.py        # Category
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── analytics/           # AI аналитика
│   │   │   ├── models.py
│   │   │   ├── views.py         # AIInsightsView
│   │   │   ├── urls.py
│   │   │   └── management/
│   │   │       └── commands/
│   │   │           └── clear_ai_cache.py
│   │   ├── blog/                # Мини-блог
│   │   │   ├── models.py        # Post, Comment, PostLike
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   └── core/                # Общие сервисы
│   │       ├── services/
│   │       │   └── openrouter_service.py  # AI API
│   │       └── exceptions.py
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py         # Базовые настройки
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py             # Корневой URLconf
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── tests/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   └── docker-compose.yml
├── my-finance-app/              # React фронтенд
│   ├── src/
│   │   ├── components/
│   │   │   ├── analytics/
│   │   │   │   ├── SummaryCards.jsx
│   │   │   │   ├── CategoryPieChart.jsx
│   │   │   │   ├── TimeBarChart.jsx
│   │   │   │   └── useAnalyticsData.js
│   │   │   ├── AIInsights.jsx   # AI рекомендации
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Transactions.jsx
│   │   │   └── ...
│   │   ├── api.js              # API клиент
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── AuthContext.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── android/                     # Android приложение
│   ├── app/
│   │   └── src/main/java/...
│   ├── build.gradle.kts
│   └── ...
├── docs/                        # Документация
│   ├── index.md
│   ├── quickstart.md
│   ├── architecture.md
│   └── ...
├── mkdocs.yml                   # MkDocs конфиг
└── README.md
```

## Компоненты системы

### 1. Authentication Service

**Расположение:** `apps/accounts/`

**Функции:**
- Регистрация/авторизация пользователей
- JWT токенная аутентификация
- Refresh токены в HttpOnly cookies
- Управление профилями

**Ключевые классы:**
```python
# models.py
class User(AbstractUser)
class Profile

# views.py
class CustomTokenObtainPairView
class CustomTokenRefreshView
class RegisterView
class ProfileView
```

### 2. Transaction Service

**Расположение:** `apps/transactions/`

**Функции:**
- CRUD транзакций
- SMS парсинг (Сбер, Тинькофф, Альфа)
- AI категоризация
- Статистика по дням/месяцам

**Ключевые классы:**
```python
# models.py
class Transaction

# services/sms_parser.py
def parse_sms(sms_text, bank_phone)
def parse_sms_batch(sms_messages)

# services/category_suggester.py
def suggest_category(description, type)
def categorize_transactions(queryset)
```

### 3. Analytics Service

**Расположение:** `apps/analytics/`

**Функции:**
- Общая сводка (summary)
- Дневные/месячные тренды
- AI рекомендации через OpenRouter

**Ключевые классы:**
```python
# views.py
class SummaryView
class DailyTrendView
class MonthlyTrendView
class AIInsightsView

# core/services/openrouter_service.py
class OpenRouterService
  - analyze_financial_data()
  - _build_prompt()
  - _normalize_insights()
  - _can_praise_user()
```

### 4. Blog Service

**Расположение:** `apps/blog/`

**Функции:**
- Публикация постов
- Лайки/комментарии
- Публичная/приватная видимость

**Ключевые классы:**
```python
# models.py
class Post
class Comment
class PostLike
```

## Поток данных

### AI Рекомендации

```
User Request
     │
     ▼
AIInsightsView.get()
     │
     ├─► Check Cache ──► Return cached (if exists)
     │
     ▼
Get Transactions (30 days)
     │
     ▼
Calculate Metrics:
  - total_income
  - total_expenses
  - balance
  - top_categories
     │
     ▼
OpenRouterService.analyze_financial_data()
     │
     ├─► Build Prompt (with metrics)
     │
     ├─► Call OpenRouter API
     │
     ├─► Parse JSON Response
     │
     ├─► Normalize Insights:
     │     - Check if user deserves praise
     │     - Limit success to 1
     │     - Add 1-2 warning
     │     - Add 1-2 info
     │
     ▼
Cache Result (1 hour)
     │
     ▼
Return JSON Response
```

### SMS Парсинг

```
User submits SMS text
     │
     ▼
TransactionViewSet.sms_parse()
     │
     ▼
parse_sms(sms_text, bank_phone)
     │
     ├─► Detect Bank (Sber, Tinkoff, Alfa)
     │
     ├─► Extract Amount (regex)
     │
     ├─► Extract Category (keywords)
     │
     ├─► Determine Type (income/expense)
     │
     ▼
Return Parsed Data
     │
     ▼
User confirms → Create Transaction
```

## Безопасность

### JWT Flow

```
┌─────────┐                              ┌─────────┐
│  Client │                              │  Server │
└────┬────┘                              └────┬────┘
     │                                        │
     │  POST /auth/login/                     │
     │  {email, password}                     │
     │───────────────────────────────────────>│
     │                                        │
     │  Set-Cookie: refresh_token (HttpOnly) │
     │  {access_token}                        │
     │<───────────────────────────────────────│
     │                                        │
     │  GET /api/protected/                   │
     │  Authorization: Bearer {access_token} │
     │───────────────────────────────────────>│
     │                                        │
     │  {data}                                │
     │<───────────────────────────────────────│
     │                                        │
     │  [Access Token Expired]                │
     │                                        │
     │  POST /auth/refresh/                   │
     │  (Cookie: refresh_token)              │
     │───────────────────────────────────────>│
     │                                        │
     │  Set-Cookie: new_refresh_token        │
     │  {new_access_token}                    │
     │<───────────────────────────────────────│
```

### Уровни доступа

| Уровень | Описание |
|---------|----------|
| **Public** | Регистрация, логин |
| **Authenticated** | Все API с JWT токеном |
| **Owner Only** | Доступ только к своим данным |
| **System** | Административные команды |

## Масштабирование

### Текущая архитектура

- Монолитное Django приложение
- SQLite для разработки
- PostgreSQL для продакшена

### Будущее масштабирование

```
                    Load Balancer (Nginx)
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │  Gunicorn │      │  Gunicorn │      │  Gunicorn │
    │  Worker 1 │      │  Worker 2 │      │  Worker 3 │
    └────┬────┘      └────┬────┘      └────┬────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │PostgreSQL │      │  Redis  │      │  Media  │
    │  Primary  │      │  Cache  │      │  (S3)   │
    └───────────┘      └─────────┘      └─────────┘
```

## Зависимости

### Бэкенд

| Зависимость | Версия | Назначение |
|-------------|--------|------------|
| Django | 5.0+ | Web фреймворк |
| djangorestframework | 3.14+ | REST API |
| djangorestframework-simplejwt | 5.3+ | JWT аутентификация |
| psycopg2-binary | 2.9+ | PostgreSQL драйвер |
| Pillow | 10.0+ | Обработка изображений |
| requests | 2.31+ | HTTP запросы (AI) |
| pytest | 7.4+ | Тестирование |

### Фронтенд

| Зависимость | Версия | Назначение |
|-------------|--------|------------|
| React | 18+ | UI фреймворк |
| Chart.js | 4.x | Графики |
| Axios | 1.x | HTTP клиент |
| TailwindCSS | 3.x | Стили |
