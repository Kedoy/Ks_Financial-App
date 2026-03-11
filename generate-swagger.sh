#!/bin/bash
# Скрипт для генерации Swagger документации

set -e

echo "📚 Ks Financial App - Swagger Documentation Generator"
echo "======================================================"

cd backend

# Проверка установленных зависимостей
if ! python -c "import drf_spectacular" 2>/dev/null; then
    echo "❌ drf-spectacular не установлен. Установка..."
    pip install -r requirements.txt
fi

# Генерация OpenAPI схемы
echo ""
echo "🔨 Генерация OpenAPI схемы..."
python manage.py spectacular --file openapi-schema.yml

# Проверка успешности
if [ $? -eq 0 ]; then
    echo "✅ Схема сгенерирована: openapi-schema.yml"
    echo ""
    echo "📁 Размер файла: $(ls -lh openapi-schema.yml | awk '{print $5}')"
    echo ""
    
    # Предложение открыть Swagger UI
    echo "🚀 Для просмотра Swagger UI:"
    echo "   1. Запустите сервер: python manage.py runserver"
    echo "   2. Откройте: http://localhost:8000/api/docs/"
    echo ""
    
    # Предложение запустить сервер
    read -p "🌐 Запустить сервер сейчас? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        python manage.py runserver 0.0.0.0:8000
    fi
else
    echo "❌ Ошибка генерации!"
    exit 1
fi
