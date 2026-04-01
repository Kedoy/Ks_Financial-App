# Ks Financial App - Docker Deployment Guide

## 🚀 Быстрый старт

### На сервере (production):

```bash
# 1. Клонировать репозиторий
git clone <your-repo-url> Ks_Financial-App
cd Ks_Financial-App

# 2. Запустить развёртывание
./deploy.sh

# ИЛИ вручную:
docker-compose build
docker-compose up -d
```

### Приложение будет доступно по:
- **Frontend:** http://your-server-ip:5173
- **Backend API:** http://your-server-ip:8000
- **API Docs:** http://your-server-ip:8000/api/docs/

---

## 📋 Требования

- Docker 20.10+
- Docker Compose 2.0+
- 2GB+ RAM (рекомендуется 4GB)
- 5GB+ свободного места на диске

---

## 🔧 Конфигурация

### Переменные окружения (.env)

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `SECRET_KEY` | Django secret key | `django-insecure-change-me-in-production` |
| `DEBUG` | Режим отладки | `True` |
| `ALLOWED_HOSTS` | Разрешённые хосты | `localhost,127.0.0.1` |
| `POSTGRES_DB` | Имя БД | `fin_db` |
| `POSTGRES_USER` | Пользователь БД | `fin_user` |
| `POSTGRES_PASSWORD` | Пароль БД | `fin_password` |
| `POSTGRES_HOST` | Хост БД | `postgres` |
| `POSTGRES_PORT` | Порт БД | `5432` |
| `REDIS_HOST` | Хост Redis | `redis` |
| `REDIS_PORT` | Порт Redis | `6379` |

---

## 🛠️ Управление

### Запуск
```bash
docker-compose up -d
```

### Остановка
```bash
docker-compose down
```

### Перезапуск
```bash
docker-compose restart
```

### Просмотр логов
```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Создание суперпользователя
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Применение миграций
```bash
docker-compose exec backend python manage.py migrate
```

### Сборка статики
```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

---

## 🧪 Тестирование

### Проверка статуса сервисов
```bash
docker-compose ps
```

### Проверка backend
```bash
curl http://localhost:8000/api/health/
```

### Проверка frontend
```bash
curl http://localhost:5173
```

### Проверка API docs
```bash
curl http://localhost:8000/api/docs/
```

---

## 📊 Архитектура

```
┌─────────────────┐
│   Nginx (80)    │
│   Frontend      │
└────────┬────────┘
         │
         └──────┐
                │
         ┌──────▼────────┐
         │  Gunicorn     │
         │  Backend      │
         │  (8000)       │
         └──────┬────────┘
                │
         ┌──────▼────────┐     ┌──────▼────────┐
         │  PostgreSQL   │     │     Redis     │
         │  (5432)       │     │     (6379)    │
         └───────────────┘     └───────────────┘
```

---

## 🔒 Production Checklist

Перед развёртыванием в production:

1. **Смените SECRET_KEY** на случайную строку:
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

2. **Установите DEBUG=False** в .env

3. **Смените пароли БД** на сложные

4. **Настройте ALLOWED_HOSTS** на ваш домен

5. **Настройте HTTPS** через reverse proxy (nginx/traefik)

6. **Настройте бэкапы** PostgreSQL:
   ```bash
   docker-compose exec postgres pg_dump -U fin_user fin_db > backup.sql
   ```

7. **Настройте мониторинг** и логирование

---

## 🐛 Troubleshooting

### Ошибка "port already allocated"
```bash
# Найти процесс на порту
lsof -i :5173
lsof -i :8000

# Остановить конфликтующие контейнеры
docker-compose down
```

### Ошибка подключения к БД
```bash
# Проверить логи
docker-compose logs postgres
docker-compose logs backend

# Пересоздать БД
docker-compose down -v
docker-compose up -d postgres
sleep 5
docker-compose up -d backend
```

### Frontend не загружается
```bash
# Пересобрать frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Backend не запускается
```bash
# Проверить логи
docker-compose logs backend

# Применить миграции вручную
docker-compose exec backend python manage.py migrate
```

### Мало памяти при сборке
```bash
# Добавить swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 📦 volumes

| Volume | Описание |
|--------|----------|
| `postgres_data` | Данные PostgreSQL |
| `backend_static` | Статические файлы Django |
| `backend_media` | Загруженные медиа файлы |

---

## 🔄 Обновление

```bash
# Получить обновления
git pull

# Пересобрать и перезапустить
docker-compose build
docker-compose up -d
```

---

## 📞 Support

При возникновении проблем:
1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус: `docker-compose ps`
3. Убедитесь, что все переменные окружения настроены
