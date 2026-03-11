# Ks_Financial-App

Система учёта и анализа персональных финансов.

## 🚀 Быстрый старт

### 1. Бэкенд (Django)

```bash
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

### 2. Фронтенд (React)

```bash
cd my-finance-app
npm run dev
```

### 3. Открыть в браузере

**http://localhost:5173**

---

## 🔐 Тестовый вход

- **Email:** `admin@admin.com`
- **Пароль:** `admin123`

---

## 📋 Функционал

- **Главная** - карточки статистики и карточки дней с транзакциями
- **Аналитика** - графики расходов (Chart.js)
- **История** - список транзакций с фильтрами

---

## 💾 База данных

- **SQLite** - для разработки (backend/db.sqlite3)
- **PostgreSQL** - для продакшена (docker-compose)
