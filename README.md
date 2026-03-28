# Ks_Financial-App

**Система учёта и анализа персональных финансов с AI-аналитикой**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Django](https://img.shields.io/badge/Django-5.0+-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![API Docs](https://img.shields.io/badge/API-Swagger-blue.svg)](https://avekedoy.github.io/Ks_Financial-App/)

---

## 🚀 Быстрый старт

### Один скрипт для запуска всего:

```bash
cd /home/avekedoy/Ks_Financial-App
./start.sh
```

Это запустит:
- ✅ PostgreSQL (база данных)
- ✅ Backend (Django на порту 8000)
- ✅ Frontend (React на порту 5173)

### Полезные команды:

```bash
./start.sh --status      # Статус сервисов
./start.sh --stop        # Остановить всё
./start.sh --restart     # Перезапустить
./start.sh --help        # Справка
```

### Открыть в браузере:

**http://localhost:5173**

📖 **Подробная инструкция:** см. [HOW_TO_RUN.md](HOW_TO_RUN.md)

---

## 🔐 Тестовый вход

- **Email:** `admin@admin.com`
- **Пароль:** `admin123`

---

## 📋 Функционал

| Модуль | Описание |
|--------|----------|
| **Главная** | Карточки статистики, последние транзакции |
| **Аналитика** | Графики расходов (Chart.js), AI-рекомендации |
| **История** | Список транзакций с фильтрами |
| **Категории** | Управление категориями доходов/расходов |
| **Блог** | Публикация заметок о финансовой грамотности |
| **SMS-парсинг** | Автоматическое создание транзакций из SMS |

---

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

### SMS Парсинг

Поддерживаемые банки:
- 🏦 **Сбербанк** (900)
- 🏦 **Тинькофф**
- 🏦 **Альфа-Банк**

---

## 💾 База данных

| Режим | База данных |
|-------|-------------|
| **Разработка** | SQLite (`backend/db.sqlite3`) |
| **Продакшен** | PostgreSQL (Docker Compose) |

---

## 📁 Структура проекта

```
Ks_Financial-App/
├── backend/              # Django REST API
│   ├── apps/
│   │   ├── accounts/    # Пользователи, профили, аутентификация
│   │   ├── transactions # Транзакции, SMS-парсинг
│   │   ├── categories/  # Категории
│   │   ├── analytics/   # AI-аналитика, рекомендации
│   │   └── blog/        # Мини-блог, посты, комментарии
│   ├── config/          # Настройки Django
│   └── requirements.txt
├── my-finance-app/      # React фронтенд
│   ├── src/
│   │   ├── components/  # React компоненты
│   │   ├── pages/       # Страницы приложения
│   │   └── api/         # API клиенты
│   └── package.json
├── android/             # Android приложение (Kotlin)
├── .github/
│   └── workflows/
│       └── deploy-swagger.yml  # Автопубликация Swagger
└── README.md
```

---

## 🛠️ Разработка

### Установка зависимостей

```bash
# Бэкенд
cd backend
pip install -r requirements.txt

# Фронтенд
cd my-finance-app
npm install
```

### Генерация Swagger локально

```bash
cd backend
python manage.py spectacular --file openapi-schema.yml
```

### Тестирование

```bash
cd backend
pytest
pytest --cov=apps
```

---

## 🚀 Развёртывание

### Docker Compose

```bash
cd backend
docker-compose up -d
```

### Переменные окружения

См. [`.env.example`](backend/.env.example)

---

## 📄 Лицензия

MIT License — см. файл [LICENSE](LICENSE)

---

## 👥 Команда

Ks Financial Team

---

## 📞 Контакты

- GitHub: [@avekedoy](https://github.com/avekedoy/Ks_Financial-App)
- API Docs: [https://avekedoy.github.io/Ks_Financial-App/](https://avekedoy.github.io/Ks_Financial-App/)
