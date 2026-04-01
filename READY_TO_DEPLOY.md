# 📦 ГОТОВО К РАЗВЁРТЫВАНИЮ

## Файлы для деплоя

Все необходимые файлы созданы и готовы к использованию.

### 📁 Структура проекта

```
Ks_Financial-App/
├── 📄 docker-compose.yml          # Основная конфигурация Docker
├── 📄 docker-compose.prod.yml     # Production конфигурация
├── 📄 .env                        # Переменные окружения
├── 📄 .gitignore                  # Git ignore файл
├── 📄 start.sh                    # Скрипт быстрого запуска
├── 📄 deploy.sh                   # Скрипт развёртывания
├── 📄 README.md                   # Главная документация
├── 📄 DEPLOYMENT.md               # Подробная инструкция по деплою
├── 📄 SERVER_SETUP.md             # Инструкция для сервера
│
├── backend/
│   ├── Dockerfile                 # Backend Docker образ
│   ├── .dockerignore              # Игнор файлы для Docker
│   ├── requirements.txt           # Python зависимости
│   ├── manage.py                  # Django management
│   └── apps/                      # Django приложения
│
├── my-finance-app/
│   ├── Dockerfile                 # Frontend Docker образ
│   ├── .dockerignore              # Игнор файлы для Docker
│   ├── package.json               # Node зависимости
│   ├── nginx.conf                 # Nginx конфиг для frontend
│   └── src/                       # React компоненты
│
└── nginx/
    ├── nginx.conf                 # Основной nginx конфиг
    └── ssl/                       # SSL сертификаты (пусто)
```

---

## 🚀 Развёртывание на сервере

### 1. Подключиться к серверу
```bash
ssh root@185.255.132.251
```

### 2. Склонировать репозиторий
```bash
cd /root
git clone https://github.com/avekedoy/Ks_Financial-App.git
cd Ks_Financial-App
```

### 3. Настроить .env (опционально)
```bash
nano .env
```

### 4. Запустить
```bash
./start.sh
```

### 5. Создать админа
```bash
docker compose exec backend python manage.py createsuperuser
```

---

## ✅ Проверка

```bash
# Статус сервисов
docker compose ps

# Логи
docker compose logs -f

# Проверка backend
curl http://localhost:8000/api/health/

# Проверка frontend
curl http://localhost:80
```

---

## 🔧 Команды управления

| Команда | Описание |
|---------|----------|
| `docker compose up -d` | Запустить |
| `docker compose down` | Остановить |
| `docker compose logs -f` | Логи |
| `docker compose restart` | Перезапуск |
| `docker compose build` | Пересборка |

---

## 📍 Приложение доступно по:

- **Frontend:** http://185.255.132.251:80
- **Backend API:** http://185.255.132.251:8000
- **API Docs:** http://185.255.132.251:8000/api/docs/

---

## 📝 Примечания

1. **Все образы собираются локально** - никаких внешних зависимостей кроме базовых образов Docker
2. **Первый запуск займёт 5-10 минут** - загрузка базовых образов и установка зависимостей
3. **Последующие запуски мгновенные** - используются кэшированные слои
4. **Требуется 2GB+ RAM** - добавьте swap если меньше

---

## 🆘 Troubleshooting

### Ошибка при сборке
```bash
# Очистить и пересобрать
docker compose down
docker system prune -f
docker compose build --no-cache
```

### Ошибка БД
```bash
# Пересоздать БД
docker compose down -v
docker compose up -d postgres
sleep 5
docker compose up -d backend
```

### Мало памяти
```bash
# Добавить swap 2GB
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

---

## 📞 Поддержка

При проблемах:
1. Проверьте логи: `docker compose logs -f`
2. Проверьте статус: `docker compose ps`
3. Убедитесь, что Docker запущен: `systemctl status docker`
