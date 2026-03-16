# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Копирование package файлов
COPY package*.json ./

# Установка зависимостей
RUN npm ci

# Копирование исходного кода
COPY . .

# Аргумент для API URL
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Сборка проекта
RUN npm run build

# Production stage
FROM nginx:alpine

# Копирование nginx конфигурации
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копирование собранного приложения
COPY --from=builder /app/dist /usr/share/nginx/html

# Порт для nginx
EXPOSE 80

# Health check - use wget to check main page with IPv4
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]
