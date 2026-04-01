# 🚀 ЗАПУСК НА СЕРВЕРЕ - ПОШАГОВАЯ ИНСТРУКЦИЯ

## ⚡ Быстрый старт (3 команды)

```bash
# 1. Клонировать
cd /root && git clone https://github.com/avekedoy/Ks_Financial-App.git && cd Ks_Financial-App

# 2. Запустить скрипт
chmod +x start.sh && ./start.sh

# 3. Создать админа
docker compose exec backend python manage.py createsuperuser
```

**Всё!** Приложение доступно: **http://185.255.132.251:80**

---

## 📋 Что делает скрипт start.sh:

1. ✅ Проверяет Docker (устанавливает если нет)
2. ✅ Проверяет docker-compose
3. ✅ Проверяет место на диске и RAM
4. ✅ Создаёт swap если мало памяти
5. ✅ Собирает Docker образы **локально**
6. ✅ Запускает все сервисы
7. ✅ Настраивает nginx

---

## 🔧 Что загружается из интернета:

Только **базовые образы Docker** (общий размер ~450MB):
- `python:3.11-slim` (~150MB)
- `node:20-alpine` (~170MB)
- `nginx:alpine` (~25MB)
- `postgres:15-alpine` (~75MB)
- `redis:7-alpine` (~15MB)

**Все зависимости (pip, npm) устанавливаются внутри контейнеров из кэша образов.**

---

## 📊 Архитектура:

```
Порт 80 (nginx)
    ├── / → frontend:80 (React статика)
    ├── /api/* → backend:8000 (Django API)
    └── /static/* → staticfiles (Django статика)

backend:8000
    ├── postgres:5432 (БД)
    └── redis:6379 (Кэш)
```

---

## ✅ Проверка работы:

```bash
# Статус сервисов
docker compose ps

# Должны быть запущены:
# ks_postgres (healthy)
# ks_backend (healthy)
# ks_frontend
# ks_nginx

# Проверка nginx
curl http://localhost/

# Проверка API
curl http://localhost/api/health/

# Проверка frontend
curl http://localhost:5173
```

---

## 🔐 Тестовый вход:

После создания суперпользователя:
- **URL:** http://185.255.132.251:80/admin
- **Email:** (который указали при создании)
- **Пароль:** (который указали при создании)

---

## 🛠️ Управление:

```bash
# Остановить
docker compose down

# Перезапустить
docker compose restart

# Логи
docker compose logs -f

# Пересобрать (если изменили код)
docker compose build
docker compose up -d

# Бэкап БД
docker compose exec postgres pg_dump -U fin_user fin_db > backup.sql
```

---

## 🐛 Если что-то пошло не так:

### Ошибка "port already allocated"
```bash
docker compose down
# Освободить порты 80, 8000, 5432
```

### Ошибка БД
```bash
docker compose logs postgres
docker compose logs backend
```

### Frontend не грузится
```bash
docker compose logs frontend
docker compose logs nginx
```

### Мало памяти
```bash
# Скрипт автоматически создаст swap 2GB
# Или вручную:
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
```

---

## 📞 Поддержка

1. Проверьте логи: `docker compose logs -f`
2. Проверьте статус: `docker compose ps`
3. Проверьте Docker: `systemctl status docker`
