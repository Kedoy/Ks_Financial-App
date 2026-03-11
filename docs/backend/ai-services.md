# AI Сервисы

## OpenRouter Service

**Расположение:** `apps/core/services/openrouter_service.py`

Сервис для генерации AI рекомендаций по финансовым данным пользователя.

### Конфигурация

```python
# .env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=arcee-ai/trinity-mini:free
SITE_URL=http://localhost:5173
SITE_NAME=Ks Financial App
```

### Использование

```python
from apps.core.services.openrouter_service import openrouter_service

financial_data = {
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
}

insights = openrouter_service.analyze_financial_data(financial_data)
```

### Структура ответа

```json
[
  {
    "category": "Сбережения",
    "insight": "Вы откладываете 25% дохода — отличный финансовый буфер!",
    "type": "success"
  },
  {
    "category": "Транспорт",
    "insight": "Транспорт составляет 30% расходов. Изучите каршеринг.",
    "type": "info"
  }
]
```

### Типы рекомендаций

| Тип | Описание | Количество |
|-----|----------|------------|
| **success** | Хвалебная/мотивирующая | 0-1 |
| **warning** | Критичные проблемы | 1-2 |
| **info** | Практические советы | 1-2 |

### Алгоритм похвалы

**Запрет на похвалу** (если хотя бы одно):
- ❌ Отрицательный баланс
- ❌ Мало транзакций (<3)
- ❌ "Глупые" траты: рестораны/развлечения > 30% расходов

**Критерии для похвалы** (хотя бы один):
- ✅ Сбережения > 20% от дохода
- ✅ Положительный баланс
- ✅ Разнообразие категорий (≥3)
- ✅ Регулярные доходы (>1 транзакции)

### Методы

#### `analyze_financial_data(financial_data: Dict) -> List[Dict]`

Основной метод анализа.

#### `_build_prompt(data: Dict) -> str`

Генерирует промпт для ИИ с финансовыми данными.

#### `_parse_response(content: str, data: Dict) -> List[Dict]`

Парсит JSON ответ от API.

#### `_normalize_insights(insights: List[Dict], data: Dict) -> List[Dict]`

Нормализует рекомендации по типам.

#### `_can_praise_user(data: Dict) -> bool`

Проверяет, заслуживает ли пользователь похвалы.

### Кэширование

```python
# Django view (apps/analytics/views.py)
cache_key = f'ai_insights_{user.id}_{days}'
cached_result = cache.get(cache_key)

if cached_result:
    return Response(cached_result)  # Возвращаем из кэша

# ... генерация рекомендаций ...

# Кэшируем на 1 час (если успех) или 5 минут (если ошибка)
cache.set(cache_key, result, 3600 if success else 300)
```

### Обработка ошибок

```python
try:
    insights = openrouter_service.analyze_financial_data(data)
except requests.exceptions.HTTPError as e:
    if e.response.status_code == 429:
        # Rate limit
        return fallback_insights('Превышен лимит запросов')
    elif e.response.status_code == 401:
        # Invalid API key
        return fallback_insights('Неверный API ключ')
```

## SMS Parser

**Расположение:** `apps/transactions/services/sms_parser.py`

Парсинг SMS от банков для автоматического создания транзакций.

### Поддерживаемые банки

| Банк | Номер | Пример SMS |
|------|-------|------------|
| **Сбербанк** | 900 | `Pokupka 1500.00 RUB. Karta *1234. Magazit 'Produkti'` |
| **Тинькофф** | +79991234567 | `1500.00 RUB списано с карты *5678 в магазине PYATEROCHKA` |
| **Альфа-Банк** | +79991234567 | `Card *9876: 3500 RUB. Berezka. Balance: 15000 RUB` |

### Использование

```python
from apps.transactions.services.sms_parser import parse_sms

parsed = parse_sms(
    sms_text="Pokupka 1500.00 RUB. Karta *1234. Magazit 'Produkti'",
    bank_phone="900"
)

# Returns:
{
    'amount': 1500.00,
    'type': 'expense',
    'category': 'Продукты',
    'description': "Magazit 'Produkti'",
    'card_number': '1234'
}
```

### Массовый парсинг

```python
from apps.transactions.services.sms_parser import parse_sms_batch

sms_messages = [
    {'text': 'SMS 1', 'phone': '900'},
    {'text': 'SMS 2', 'phone': '900'}
]

results = parse_sms_batch(sms_messages)
```

## Category Suggester

**Расположение:** `apps/transactions/services/category_suggester.py`

Автоматическая категоризация транзакций по ключевым словам.

### Категории и ключевые слова

| Категория | Ключевые слова |
|-----------|----------------|
| **Продукты** | магнит, пятёрочка, перекрёсток, продукты, еда |
| **Транспорт** | такси, uber, яндекс, метро, бензин, лукойл |
| **Кафе** | ресторан, кафе, бар, starbucks, макдоналдс, kfc |
| **Развлечения** | кино, театр, концерт, парк, караоке |
| **Здоровье** | аптека, больница, клиника, лекарства |
| **Покупки** | ozon, wildberries, одежда, обувь |
| **Зарплата** | зарплата, salary, аванс, премия |

### Использование

```python
from apps.transactions.services.category_suggester import suggest_category

category = suggest_category(
    description="Обед в ресторане",
    transaction_type="expense"
)
# Returns: Category object (Кафе и рестораны)
```

### Массовая категоризация

```python
from apps.transactions.services.category_suggester import categorize_transactions

transactions = Transaction.objects.filter(category__isnull=True)
count = categorize_transactions(transactions)
print(f"Categorized {count} transactions")
```

## Управление AI кэшем

### Команда Django

```bash
# Очистить весь AI кэш
python manage.py clear_ai_cache

# Очистить кэш конкретного пользователя
python manage.py clear_ai_cache --user-id 123
```

### Исходный код команды

```python
# apps/analytics/management/commands/clear_ai_cache.py
from django.core.management.base import BaseCommand
from django.core.cache import cache

class Command(BaseCommand):
    def handle(self, *args, **options):
        cache_keys = cache.keys('ai_insights_*')
        cache.delete_many(cache_keys)
        self.stdout.write(f'Cleared {len(cache_keys)} cache keys')
```

## Тестирование

### Тест OpenRouter

```python
from apps.core.services.openrouter_service import openrouter_service

data = {
    'period_days': 30,
    'total_expenses': 50000,
    'total_income': 100000,
    'balance': 50000,
    'expense_count': 25,
    'income_count': 5,
    'top_categories': [
        {'name': 'Еда', 'total': 20000},
        {'name': 'Транспорт', 'total': 10000}
    ]
}

insights = openrouter_service.analyze_financial_data(data)
assert len(insights) > 0
assert all('category' in i and 'insight' in i for i in insights)
```

### Тест SMS парсера

```python
from apps.transactions.services.sms_parser import parse_sms

# Сбербанк
parsed = parse_sms(
    "Pokupka 1500.00 RUB. Karta *1234. Magazit 'Produkti'",
    "900"
)
assert parsed['amount'] == 1500.00
assert parsed['type'] == 'expense'
```
