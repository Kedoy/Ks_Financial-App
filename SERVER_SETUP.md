# 🚀 ИНСТРУКЦИЯ ПО РАЗВЁРТЫВАНИЮ НА СЕРВЕРЕ

## Быстрый старт (5 минут)

### Шаг 1: Подключиться к серверу
```bash
ssh root@185.255.132.251
```

### Шаг 2: Склонировать репозиторий
```bash
cd /root
git clone https://github.com/avekedoy/Ks_Financial-App.git
cd Ks_Financial-App
```

### Шаг 3: Настроить переменные окружения
```bash
cat > .env << 'EOF'
SECRET_KEY=django-insecure-change-me-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,185.255.132.251

POSTGRES_DB=fin_db
POSTGRES_USER=fin_user
POSTGRES_PASSWORD=fin_password

CORS_ALLOWED_ORIGINS=http://185.255.132.251:80,http://185.255.132.251:5173
FRONTEND_URL=http://185.255.132.251:80
EOF
```

### Шаг 4: Запустить приложение
```bash
./start.sh
```

### Шаг 5: Создать суперпользователя
```bash
docker compose exec backend python manage.py createsuperuser
```

**Готово!** Приложение доступно по: http://185.255.132.251:80

---

## Подробная инструкция

### Требования
- Docker 20.10+
- Docker Compose 2.0+
- 2GB+ RAM
- 5GB+ места на диске

### Установка Docker (если не установлен)
```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
```

### Проверка
```bash
docker --version
docker compose version
```

### Запуск
```bash
# Сборка образов (первый раз ~5-10 минут)
docker compose build

# Запуск сервисов
docker compose up -d

# Проверка статуса
docker compose ps

# Проверка логов
docker compose logs -f backend
```

### Настройка nginx (опционально)
```bash
# Проверка конфигурации
nginx -t

# Перезапуск nginx
systemctl restart nginx
```

---

## Команды управления

| Команда | Описание |
|---------|----------|
| `docker compose up -d` | Запустить все сервисы |
| `docker compose down` | Остановить все сервисы |
| `docker compose down -v` | Остановить и удалить данные |
| `docker compose ps` | Статус сервисов |
| `docker compose logs -f` | Логи всех сервисов |
| `docker compose logs -f backend` | Логи backend |
| `docker compose logs -f frontend` | Логи frontend |
| `docker compose restart` | Перезапуск |
| `docker compose build` | Пересборка образов |
| `docker compose exec backend python manage.py createsuperuser` | Создать админа |

---

## Проверка работы

### Backend
```bash
curl http://localhost:8000/api/health/
```

### Frontend
```bash
curl http://localhost:80
```

### API Docs
```bash
curl http://localhost:8000/api/docs/
```

---

## Бэкап данных

### Создать бэкап
```bash
docker compose exec postgres pg_dump -U fin_user fin_db > backup-$(date +%Y%m%d).sql
```

### Восстановить из бэкапа
```bash
docker compose exec -T postgres psql -U fin_user -d fin_db < backup-20260328.sql
```

---

## Обновление

```bash
# Получить обновления
git pull

# Пересобрать образы
docker compose build

# Перезапустить сервисы
docker compose up -d
```

---

## Troubleshooting

### Ошибка "port already allocated"
```bash
# Остановить все контейнеры
docker compose down

# Проверить占用 портов
netstat -tlnp | grep :80
netstat -tlnp | grep :8000
```

### Ошибка БД
```bash
# Посмотреть логи
docker compose logs postgres
docker compose logs backend

# Пересоздать БД
docker compose down -v
docker compose up -d postgres
sleep 5
docker compose up -d backend
```

### Мало памяти
```bash
# Добавить swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

---

## Контакты

При проблемах:
1. Проверьте логи: `docker compose logs -f`
2. Проверьте статус: `docker compose ps`
3. Убедитесь, что порты открыты в фаерволе
