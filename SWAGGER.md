# Swagger API Документация

## Обзор

Проект использует **Swagger/OpenAPI** для автоматической генерации API документации через `drf-spectacular`.

## Возможности

- ✅ **Автоматическая генерация** - схема создаётся из Django REST Framework serializers и views
- ✅ **Интерактивный UI** - тестирование API прямо из браузера
- ✅ **Бесплатный хостинг** - публикация на GitHub Pages
- ✅ **Автообновление** - документация обновляется при каждом push в main

## Ссылки

| Описание | URL |
|----------|-----|
| **GitHub Pages** | https://avekedoy.github.io/Ks_Financial-App/ |
| **Swagger UI** | http://localhost:8000/api/docs/ |
| **ReDoc** | http://localhost:8000/api/redoc/ |
| **OpenAPI Schema** | http://localhost:8000/api/schema/ |

## Локальная разработка

### 1. Установка зависимостей

```bash
cd backend
pip install -r requirements.txt
```

### 2. Генерация схемы

```bash
python manage.py spectacular --file openapi-schema.yml
```

Или используйте скрипт:

```bash
./generate-swagger.sh
```

### 3. Запуск сервера

```bash
python manage.py runserver 0.0.0.0:8000
```

### 4. Открыть Swagger UI

Откройте **http://localhost:8000/api/docs/**

## Публикация на GitHub Pages

### Автоматически (GitHub Actions)

Документация публикуется автоматически при push в ветку `main`:

```yaml
# .github/workflows/deploy-swagger.yml
on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-swagger.yml'
```

### Workflow процесс:

1. **Checkout** - загрузка кода
2. **Install dependencies** - установка drf-spectacular
3. **Generate Schema** - генерация openapi-schema.yml
4. **Download Swagger UI** - загрузка пре-билд файлов
5. **Create index.html** - кастомный HTML с конфигом
6. **Upload artifact** - загрузка артефакта
7. **Deploy to Pages** - публикация

### Вручную (локально)

```bash
# 1. Сгенерировать схему
cd backend
python manage.py spectacular --file openapi-schema.yml

# 2. Скачать Swagger UI
curl -L https://github.com/swagger-api/swagger-ui/archive/v5.10.0.tar.gz | tar -xzf -
cp -r swagger-ui-5.10.0/dist/* swagger-ui/
cp openapi-schema.yml swagger-ui/

# 3. Создать index.html (см. workflow)

# 4. Открыть swagger-ui/index.html в браузере
```

## Настройка (Django)

### settings.py

```python
INSTALLED_APPS = [
    # ...
    'drf_spectacular',
]

REST_FRAMEWORK = {
    # ...
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Ks Financial App API',
    'DESCRIPTION': 'API для системы учёта и анализа персональных финансов',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SWAGGER_UI_DIST': 'https://unpkg.com/swagger-ui-dist@latest',
}
```

### urls.py

```python
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # ...
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
```

## Добавление документации к View

### Базовый пример

```python
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view

@extend_schema_view(
    list=extend_schema(
        summary="Список транзакций",
        description="Получить список всех транзакций пользователя с пагинацией",
    ),
    retrieve=extend_schema(
        summary="Детали транзакции",
        description="Получить подробную информацию о конкретной транзакции",
    ),
)
class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
```

### Параметры запроса

```python
from drf_spectacular.utils import OpenApiParameter, OpenApiExample

@extend_schema(
    parameters=[
        OpenApiParameter(
            name='days',
            type=int,
            location=OpenApiParameter.QUERY,
            description='Количество дней для анализа',
            default=30,
        ),
    ],
    examples=[
        OpenApiExample(
            'Успешный ответ',
            value={'insights': [...], 'summary': {...}},
        ),
    ],
)
def get(self, request):
    # ...
```

### Теги

```python
from drf_spectacular.utils import extend_schema

@extend_schema(
    tags=['Analytics'],
    summary='AI рекомендации',
    description='Получить персональные AI рекомендации по финансам',
)
class AIInsightsView(APIView):
    # ...
```

## API Endpoints

### Auth

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/v1/auth/login/` | Вход (JWT токены) |
| POST | `/api/v1/auth/logout/` | Выход |
| POST | `/api/v1/auth/register/` | Регистрация |
| POST | `/api/v1/auth/refresh/` | Обновление токена |
| GET | `/api/v1/auth/me/` | Текущий пользователь |

### Transactions

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/transactions/` | Список транзакций |
| POST | `/api/v1/transactions/` | Создать транзакцию |
| GET | `/api/v1/transactions/{id}/` | Детали транзакции |
| PUT | `/api/v1/transactions/{id}/` | Обновить транзакцию |
| DELETE | `/api/v1/transactions/{id}/` | Удалить транзакцию |
| POST | `/api/v1/transactions/sms-parse/` | Парсинг SMS |

### Analytics

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/analytics/summary/` | Общая сводка |
| GET | `/api/v1/analytics/daily/` | Дневные тренды |
| GET | `/api/v1/analytics/monthly/` | Месячные тренды |
| GET | `/api/v1/analytics/ai-insights/` | AI рекомендации |

## Аутентификация в Swagger UI

1. Откройте http://localhost:8000/api/docs/
2. Нажмите кнопку **Authorize** 🔓
3. Введите JWT токен: `Bearer eyJ0eXAiOiJKV1QiLCJhbGc...`
4. Нажмите **Authorize**
5. Теперь можно тестировать защищённые endpoints

## Примеры ответов

### Успех (200 OK)

```json
{
  "count": 100,
  "next": "/api/v1/transactions/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "amount": "1500.00",
      "category": 5,
      "description": "Обед в кафе",
      "type": "expense",
      "date": "2024-03-11T12:00:00Z"
    }
  ]
}
```

### Ошибка (400 Bad Request)

```json
{
  "amount": [
    "Это поле обязательно."
  ],
  "type": [
    "Значение \"invalid\" не является допустимым выбором."
  ]
}
```

### Ошибка (401 Unauthorized)

```json
{
  "detail": "Учетные данные не были предоставлены."
}
```

## Структуры файлов

### swagger-ui/

```
swagger-ui/
├── index.html              # Кастомный HTML
├── openapi-schema.yml      # Сгенерированная схема
├── swagger-ui.css          # Стили
├── swagger-ui-bundle.js    # JS бандл
├── swagger-ui-standalone-preset.js
├── favicon-16x16.png
└── favicon-32x32.png
```

### backend/

```
backend/
├── openapi-schema.yml      # Сгенерированная схема (gitignored)
├── config/
│   ├── settings/
│   │   └── base.py         # SPECTACULAR_SETTINGS
│   └── urls.py             # Swagger endpoints
└── apps/
    ├── accounts/
    ├── transactions/
    ├── analytics/
    └── ...
```

## Тестирование

### Проверка схемы

```bash
python manage.py spectacular --file openapi-schema.yml --validate
```

### Генерация в CI/CD

```yaml
- name: Generate OpenAPI Schema
  run: |
    cd backend
    python manage.py spectacular --file openapi-schema.yml
```

## Отключение endpoints из документации

```python
from drf_spectacular.utils import extend_schema

@extend_schema(exclude=True)
class InternalView(APIView):
    # Не появится в документации
    pass
```

## Версионирование

```python
SPECTACULAR_SETTINGS = {
    'VERSION': '1.0.0',  # Обновляйте при изменениях API
    # ...
}
```

## Ссылки

- [drf-spectacular документация](https://drf-spectacular.readthedocs.io/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [GitHub Pages](https://pages.github.com/)
