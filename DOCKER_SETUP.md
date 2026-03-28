# 🐳 Docker Setup Guide

## 📋 Компоненты

| Сервис | Контейнер | Порт | Описание |
|--------|-----------|------|----------|
| **PostgreSQL** | `ks_postgres` | 5432 | База данных |
| **Backend** | `ks_backend` | 8000 | Django REST API |
| **Frontend** | `ks_frontend` | 5173 | React приложение |

---

## 🚀 Быстрый старт

### Запуск

```bash
cd /home/avekedoy/Ks_Financial-App
./start.sh
```

### Остановка

```bash
./start.sh --stop
```

### Перезапуск

```bash
./start.sh --restart
```

### Просмотр логов

```bash
./start.sh --logs
```

### Статус

```bash
./start.sh --status
```

---

## 🔗 Логика работы компонентов

```
┌─────────────────┐
│   Browser       │
│ localhost:5173  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│    Frontend (Nginx)     │
│  React + Nginx:80       │
│  - Статика (HTML/CSS/JS)│
│  - Прокси /api/* → B.E. │
└────────┬────────────────┘
         │ /api/*
         ▼
┌─────────────────────────┐
│    Backend (Gunicorn)   │
│  Django:8000            │
│  - REST API             │
│  - Бизнес-логика        │
│  - AI-аналитика         │
└────────┬────────────────┘
         │ SQL запросы
         ▼
┌─────────────────────────┐
│    PostgreSQL           │
│  Database:5432          │
│  - Пользователи         │
│  - Транзакции           │
│  - Категории            │
│  - AI рекомендации      │
└─────────────────────────┘
```

### Поток запроса:

1. **Пользователь** открывает `http://localhost:5173`
2. **Frontend (Nginx)** отдаёт статические файлы React приложения
3. **React** делает API запросы на `/api/*`
4. **Nginx** проксирует `/api/*` запросы на `http://backend:8000`
5. **Backend (Django)** обрабатывает запрос, делает SQL запросы к PostgreSQL
6. **PostgreSQL** возвращает данные
7. **Backend** возвращает JSON ответ через Nginx в Frontend
8. **React** обновляет UI

---

## 📁 Структура файлов

```
Ks_Financial-App/
├── docker-compose.yml      # Оркестрация всех сервисов
├── .env                    # Переменные окружения
├── .dockerignore           # Исключения для Docker
├── start.sh                # Скрипт запуска
├── backend/
│   ├── Dockerfile          # Образ Backend
│   └── ...
└── my-finance-app/
    ├── Dockerfile          # Образ Frontend
    └── nginx.conf          # Конфиг Nginx для Frontend
```

---

## ⚙️ Настройка

### Переменные окружения (`.env`)

```bash
# База данных
POSTGRES_DB=fin_db
POSTGRES_USER=fin_user
POSTGRES_PASSWORD=fin_password

# Django
SECRET_KEY=django-insecure-change-me-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# JWT токены
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=15
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

### Сеть

Все сервисы в одной сети `ks_network`:
- Backend может обращаться к PostgreSQL по имени `postgres`
- Frontend (Nginx) может обращаться к Backend по имени `backend`
- Порты 5432, 8000, 5173 проброшены наружу

---

## 🔧 Команды Docker

### Ручное управление

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Пересборка
docker-compose up -d --build

# Логи
docker-compose logs -f backend

# Вход в контейнер
docker-compose exec backend bash
docker-compose exec postgres psql -U fin_user -d fin_db

# Статус
docker-compose ps
```

### Очистка

```bash
# Остановить + удалить volumes (данные БД!)
docker-compose down -v

# Остановить + удалить volumes + образы
docker-compose down -v --rmi all
```

---

## 🏗️ Сборка образов

```bash
# Собрать все образы
docker-compose build

# Собрать только backend
docker-compose build backend

# Собрать без кэша
docker-compose build --no-cache
```

---

## 🐛 Отладка

### Проверка логов

```bash
# Все сервисы
docker-compose logs -f

# Только backend
docker-compose logs -f backend

# Только frontend
docker-compose logs -f frontend

# Только database
docker-compose logs -f postgres
```

### Вход в контейнеры

```bash
# Backend (Django)
docker-compose exec backend bash

# Frontend (Nginx)
docker-compose exec frontend sh

# Database (PostgreSQL)
docker-compose exec postgres psql -U fin_user -d fin_db
```

### Перезапуск отдельного сервиса

```bash
docker-compose restart backend
```

---

## 📊 Тома (Volumes)

| Том | Назначение |
|-----|------------|
| `postgres_data` | Данные PostgreSQL (сохраняются при перезапуске) |
| `backend_static` | Статические файлы Django |
| `backend_media` | Медиа файлы пользователей |

---

## 🔐 Безопасность

### Для продакшена:

1. Измените `SECRET_KEY` в `.env`
2. Установите `DEBUG=False`
3. Смените пароли БД
4. Настройте `ALLOWED_HOSTS`
5. Используйте HTTPS (добавьте SSL в Nginx)

---

## 📝 Тестовый вход

- **Email:** `admin@admin.com`
- **Пароль:** `admin123`

---

## ❓ Troubleshooting

### Backend не подключается к БД

```bash
# Проверьте, что PostgreSQL запущен
docker-compose ps postgres

# Проверьте логи
docker-compose logs postgres
docker-compose logs backend
```

### Frontend не видит Backend

```bash
# Проверьте, что backend запущен
docker-compose ps backend

# Проверьте логи nginx
docker-compose logs frontend
```

### Миграции не применяются

```bash
# Применить вручную
docker-compose exec backend python manage.py migrate

# Создать миграции
docker-compose exec backend python manage.py makemigrations
```

### Сброс БД

```bash
# Остановить и удалить volumes
docker-compose down -v

# Запустить заново
docker-compose up -d
```

---

## 🎯 Минимальная конфигурация

Все контейнеры настроены минимально:

- **PostgreSQL**: только базовая конфигурация
- **Backend**: 2 worker'а Gunicorn
- **Frontend**: Nginx без кэширования

Для увеличения производительности в продакшене:
- Увеличьте `--workers` в Gunicorn
- Настройте кэширование в Nginx
- Добавьте Redis для кэширования
