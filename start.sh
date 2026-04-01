#!/bin/bash

# Ks Financial App - Quick Start Script
# Быстрый запуск приложения на сервере
# ВСЁ РАБОТАЕТ ЛОКАЛЬНО - минимальные загрузки из интернета

set -e

echo "=========================================="
echo "  Ks Financial App - Quick Start        "
echo "=========================================="
echo ""

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker не найден! Установка Docker...${NC}"
    echo "   ВНИМАНИЕ: Требуется подключение к интернету для установки Docker"
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sh /tmp/get-docker.sh
    systemctl enable docker
    systemctl start docker
else
    echo -e "${GREEN}✓${NC} Docker найден: $(docker --version)"
fi

# Проверка docker-compose (поддержка обеих версий)
COMPOSE_CMD="docker compose"
if ! command -v docker-compose &> /dev/null; then
    # Пробуем установить docker-compose-plugin
    echo -e "${YELLOW}⚠️ docker compose v2 не найден, пробуем установить...${NC}"
    if command -v apt-get &> /dev/null; then
        apt-get update -qq
        apt-get install -y -qq docker-compose-plugin 2>/dev/null || true
    fi
fi

# Проверяем какая команда работает
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif docker-compose version &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo -e "${RED}❌ Docker Compose не найден! Установка...${NC}"
    if command -v apt-get &> /dev/null; then
        apt-get update -qq
        apt-get install -y -qq docker-compose
    fi
    COMPOSE_CMD="docker-compose"
fi

echo -e "${GREEN}✓${NC} Compose: $($COMPOSE_CMD --version)"
echo ""

# Остановка старых контейнеров
echo -e "${YELLOW}📦 Остановка старых контейнеров...${NC}"
$COMPOSE_CMD down 2>/dev/null || true

# Проверка места на диске
echo ""
echo -e "${YELLOW}📊 Проверка ресурсов...${NC}"
df -h / | tail -1 | awk '{print "   Диск: "$4" свободно ("$5" занято)"}'
free -h | grep Mem | awk '{print "   RAM: "$7" доступно из "$2}'

# Проверка swap (если мало RAM)
AVAILABLE_RAM=$(free -m | grep Mem | awk '{print $7}')
if [ "$AVAILABLE_RAM" -lt 1000 ]; then
    echo -e "${YELLOW}⚠️ Мало свободной RAM (< 1GB). Проверка swap...${NC}"
    SWAP_USED=$(swapon --show | wc -l)
    if [ "$SWAP_USED" -eq 0 ]; then
        echo -e "${YELLOW}   Создаём swap 2GB...${NC}"
        if [ ! -f /swapfile ]; then
            fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
            chmod 600 /swapfile
            mkswap /swapfile
            swapon /swapfile
            echo '/swapfile none swap sw 0 0' >> /etc/fstab
            echo -e "${GREEN}   ✓ Swap создан${NC}"
        else
            swapon /swapfile 2>/dev/null || true
            echo -e "${GREEN}   ✓ Swap активирован${NC}"
        fi
    fi
fi

# Сборка образов
echo ""
echo -e "${YELLOW}🔨 Сборка Docker образов...${NC}"
echo "   (первый запуск может занять 5-10 минут)"
echo "   Загружаются только базовые образы с Docker Hub:"
echo "   - python:3.11-slim (~150MB)"
echo "   - node:20-alpine (~170MB)"
echo "   - nginx:alpine (~25MB)"
echo "   - postgres:15-alpine (~75MB)"
echo "   - redis:7-alpine (~15MB)"
echo ""
$COMPOSE_CMD build

# Запуск сервисов
echo ""
echo -e "${YELLOW}🚀 Запуск сервисов...${NC}"
$COMPOSE_CMD up -d

# Ожидание запуска
echo ""
echo -e "${YELLOW}⏳ Ожидание запуска сервисов...${NC}"
sleep 10

# Проверка статуса
echo ""
echo -e "${YELLOW}📊 Статус сервисов:${NC}"
$COMPOSE_CMD ps

# Проверка nginx
echo ""
echo -e "${YELLOW}🔧 Настройка nginx...${NC}"
if [ -f /etc/nginx/nginx.conf ]; then
    # Копируем наш конфиг nginx если он есть
    if [ -f ./nginx/nginx.conf ]; then
        # Создаём резервную копию
        cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup 2>/dev/null || true
        # Копируем наш конфиг
        cp ./nginx/nginx.conf /etc/nginx/nginx.conf
        # Проверяем конфигурацию
        if nginx -t 2>/dev/null; then
            echo -e "${GREEN}   ✓ Nginx конфигурация применена${NC}"
            systemctl restart nginx 2>/dev/null || service nginx restart 2>/dev/null || true
        else
            echo -e "${YELLOW}   ⚠️ Ошибка в конфигурации nginx, используем стандартную${NC}"
            mv /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf 2>/dev/null || true
        fi
    fi
fi

# Логи backend
echo ""
echo -e "${YELLOW}📋 Последние логи backend:${NC}"
$COMPOSE_CMD logs --tail=20 backend 2>/dev/null || true

# Финальное сообщение
echo ""
echo "=========================================="
echo -e "${GREEN}✅ ГОТОВО!${NC}"
echo "=========================================="
echo ""
echo "📍 Приложение доступно:"
echo "   http://localhost:80 (nginx)"
echo "   http://localhost:5173 (frontend напрямую)"
echo "   http://localhost:8000 (backend напрямую)"
echo "   http://localhost:8000/api/docs/ (API документация)"
echo ""
echo "📍 Создание суперпользователя:"
echo "   $COMPOSE_CMD exec backend python manage.py createsuperuser"
echo ""
echo "📍 Команды управления:"
echo "   Остановить: $COMPOSE_CMD down"
echo "   Логи: $COMPOSE_CMD logs -f"
echo "   Перезапуск: $COMPOSE_CMD restart"
echo "   Пересборка: $COMPOSE_CMD build"
echo ""
