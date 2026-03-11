# Ks Financial App

**Система учёта и анализа персональных финансов с AI-аналитикой**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Django](https://img.shields.io/badge/Django-5.0+-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)

---

## 📖 О проекте

Ks Financial App — это кроссплатформенное приложение для учёта и анализа персональных финансов с интеграцией искусственного интеллекта для:

- 🤖 **AI-аналитики** — персональные рекомендации по экономии
- 📊 **Детальной аналитики** — графики, диаграммы, тренды
- 📱 **SMS-парсинга** — автоматическое создание транзакций из SMS банков
- 📝 **Мини-блога** — заметки о финансовой грамотности

## 🚀 Быстрый старт

### Бэкенд (Django)

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Фронтенд (React)

```bash
cd my-finance-app
npm install
npm run dev
```

### Открыть в браузере

**http://localhost:5173**

**Тестовый вход:**
- Email: `admin@admin.com`
- Пароль: `admin123`

## 📋 Основной функционал

| Модуль | Описание |
|--------|----------|
| **Главная** | Карточки статистики, последние транзакции |
| **Аналитика** | Графики расходов (Chart.js), AI-рекомендации |
| **История** | Список транзакций с фильтрами |
| **Категории** | Управление категориями доходов/расходов |
| **Блог** | Публикация заметок о финансовой грамотности |
| **SMS-парсинг** | Автоматическое создание транзакций из SMS |

## 🏗️ Архитектура

```
Ks_Financial-App/
├── backend/              # Django REST API
│   ├── apps/
│   │   ├── accounts/    # Пользователи, профили, аутентификация
│   │   ├── transactions # Транзакции, SMS-парсинг
│   │   ├── categories/  # Категории
│   │   ├── analytics/   # AI-аналитика, рекомендации
│   │   ├── blog/        # Мини-блог, посты, комментарии
│   │   └── core/        # Общие сервисы, OpenRouter API
│   ├── config/          # Настройки Django
│   └── requirements.txt
├── my-finance-app/      # React фронтенд
│   ├── src/
│   │   ├── components/  # React компоненты
│   │   ├── pages/       # Страницы приложения
│   │   └── api/         # API клиенты
│   └── package.json
└── android/             # Android приложение (Kotlin)
```

## 💾 База данных

| Режим | База данных |
|-------|-------------|
| **Разработка** | SQLite (`backend/db.sqlite3`) |
| **Продакшен** | PostgreSQL (Docker Compose) |

## 🔐 Безопасность

- **JWT Authentication** — Access + Refresh токены
- **HttpOnly Cookies** — Refresh Token в защищённых cookie
- **CORS** — Настройка разрешённых origin
- **Input Validation** — Валидация всех входных данных

## 🤖 AI Функционал

### AI Рекомендации

Система генерирует 3 типа рекомендаций:

| Тип | Описание | Количество |
|-----|----------|------------|
| **success** | Хвалебная (только если заслужил) | 0-1 |
| **warning** | Критичные проблемы | 1-2 |
| **info** | Практические советы | 1-2 |

**Алгоритм похвалы:**
- ✅ Положительный баланс
- ✅ Сбережения > 20% дохода
- ✅ Разнообразие категорий (≥3)
- ❌ Запрет при "глупых" тратах > 30%

### AI Классификация

Автоматическая категоризация транзакций по описанию:
- Ключевые слова для банков
- Распознавание типов операций
- Пометка `is_ai_parsed`

## 📱 SMS Парсинг

Поддерживаемые банки:

- 🏦 **Сбербанк** (900)
- 🏦 **Тинькофф**
- 🏦 **Альфа-Банк**

Пример SMS:
```
Pokupka 1500.00 RUB. Karta *1234. Magazit 'Produkti'. Ost. 25000.00 RUB
```

## 🧪 Тестирование

```bash
cd backend
source venv/bin/activate
pytest
pytest --cov=apps
```

## 📦 Развёртывание

### Docker Compose

```bash
cd backend
docker-compose up -d
```

### Переменные окружения

См. [`.env.example`](backend/.env.example)

## 📄 Лицензия

MIT License — см. файл [LICENSE](LICENSE)

## 👥 Команда

Ks Financial Team

## 📞 Контакты

- GitHub: [@avekedoy](https://github.com/avekedoy/Ks_Financial-App)
- Email: noreply@ks-financial-app.com
