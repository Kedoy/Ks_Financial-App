# Swagger API Документация

## Обзор

Проект использует **Swagger/OpenAPI** для автоматической генерации API документации через `drf-spectacular`.

## Возможности

- ✅ **Автоматическая генерация** - схема создаётся из Django REST Framework serializers и views
- ✅ **Интерактивный UI** - тестирование API прямо из браузера
- ✅ **Бесплатный хостинг** - публикация на GitHub Pages
- ✅ **Автообновление** - документация обновляется при каждом push в main

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

- **Swagger UI:** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/
- **OpenAPI Schema:** http://localhost:8000/api/schema/

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
```

### Вручную

1. Сгенерируйте схему:
   ```bash
   cd backend
   python manage.py spectacular --file openapi-schema.yml
   ```

2. Создайте папку swagger-ui:
   ```bash
   mkdir -p swagger-ui
   cp openapi-schema.yml swagger-ui/
   ```

3. Скачайте Swagger UI:
   ```bash
   curl -L https://github.com/swagger-api/swagger-ui/archive/v5.10.0.tar.gz | tar -xzf - -C swagger-ui --strip-components=1
   ```

4. Создайте index.html (см. workflow файл)

5. Задеплойте на GitHub Pages

## Структура URL

| URL | Описание |
|-----|----------|
| `/api/docs/` | Swagger UI (интерактивный) |
| `/api/redoc/` | ReDoc (статичный) |
| `/api/schema/` | OpenAPI схема (YAML) |

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
    # ... остальные настройки
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

## Аутентификация в Swagger UI

1. Откройте http://localhost:8000/api/docs/
2. Нажмите кнопку **Authorize** 🔓
3. Введите JWT токен: `Bearer eyJ0eXAiOiJKV1QiLCJhbGc...`
4. Нажмите **Authorize**
5. Теперь можно тестировать защищённые endpoints

## Управление версиями

### Версионирование схемы

```python
SPECTACULAR_SETTINGS = {
    'VERSION': '1.0.0',  # Обновляйте при изменениях API
    # ...
}
```

### Отключение endpoints из документации

```python
from drf_spectacular.utils import extend_schema

@extend_schema(exclude=True)
class InternalView(APIView):
    # Не появится в документации
    pass
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

## Ссылки

- [drf-spectacular документация](https://drf-spectacular.readthedocs.io/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [GitHub Pages](https://pages.github.com/)
