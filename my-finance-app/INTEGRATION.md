# Интеграция React + Django

## ✅ Выполненные задачи

### 1. Установка зависимостей
```bash
cd my-finance-app
npm install axios
```

### 2. Создан API клиент (`src/api/client.js`)

**Функции:**
- Axios инстанс с базовым URL `http://localhost:8000/api/v1`
- Интерцептор для добавления JWT токена
- Автоматическое обновление токена при истечении
- Обработка ошибок аутентификации

**API модули:**
- `authAPI` - регистрация, вход, выход, профиль
- `transactionsAPI` - CRUD транзакций, SMS парсинг, статистика
- `accountsAPI` - CRUD счетов
- `categoriesAPI` - категории (системные + пользовательские)
- `analyticsAPI` - аналитика и отчёты
- `postsAPI` - социальный модуль (посты, комментарии, лайки)

### 3. Обновлён AuthContext (`src/auth/AuthContext.jsx`)

**Изменения:**
- Добавлена поддержка Django API аутентификации
- Сохранена поддержка гостевого режима (localStorage)
- Автоматическая загрузка профиля при старте
- Обработка истечения токена

**Новые методы:**
- `login(email, password)` - вход через API
- `logout()` - выход через API
- `register(email, password, guestData)` - регистрация через API
- `isAuthenticated` - флаг авторизации
- `loading` - статус загрузки

### 4. Обновлён AuthModal (`src/components/AuthModal.jsx`)

**Изменения:**
- Email вместо username
- Асинхронные вызовы API
- Обработка ошибок от Django

### 5. Конфигурация (`.env`)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 🚀 Запуск приложений

### 1. Запуск Django бэкенда

```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**Порт:** `http://localhost:8000`

### 2. Запуск React фронтенда

```bash
cd my-finance-app
npm run dev
```

**Порт:** `http://localhost:5173`

---

## 📝 Тестирование интеграции

### 1. Регистрация нового пользователя

```javascript
import { authAPI } from './api/client';

const response = await authAPI.register({
  email: 'test@example.com',
  password: 'password123',
  password_confirm: 'password123',
  username: 'testuser'
});

console.log(response.data);
// { access_token: "...", user: {...} }
```

### 2. Вход

```javascript
import { authAPI } from './api/client';

const response = await authAPI.login('test@example.com', 'password123');

console.log(response.data);
// { access_token: "...", user: {...} }
```

### 3. Получение транзакций

```javascript
import { transactionsAPI } from './api/client';

const response = await transactionsAPI.list({ limit: 50 });

console.log(response.data);
// { count: N, next: "...", previous: "...", results: [...] }
```

### 4. Создание транзакции

```javascript
import { transactionsAPI } from './api/client';

const response = await transactionsAPI.create({
  amount: 1500.00,
  description: 'Продукты в Магните',
  type: 'expense',
  category: 1,
  date: '2024-01-15T14:30:00Z'
});
```

### 5. Получение аналитики

```javascript
import { analyticsAPI } from './api/client';

const response = await analyticsAPI.summary({ days: 30 });

console.log(response.data);
// {
//   total_expenses: 15000,
//   total_income: 50000,
//   balance: 35000,
//   top_categories: [...]
// }
```

---

## 🔐 Аутентификация

### Как это работает

1. **При входе** Django возвращает `access_token`
2. **Токен сохраняется** в `localStorage.getItem('access_token')`
3. **API клиент автоматически** добавляет токен в заголовок:
   ```
   Authorization: Bearer <token>
   ```
4. **При истечении токена** (401 ошибка):
   - Автоматический запрос на `/api/v1/auth/refresh/`
   - Обновление токена из HttpOnly Cookie
   - Повтор оригинального запроса

### Безопасность

- ✅ Refresh Token в HttpOnly Cookie (защита от XSS)
- ✅ Access Token в localStorage
- ✅ CORS настроен для `localhost:5173`
- ✅ HTTPS в продакшене

---

## 📊 Структура API клиента

```
src/api/
└── client.js
    ├── apiClient (axios instance)
    ├── authAPI
    │   ├── register()
    │   ├── login()
    │   ├── logout()
    │   ├── getProfile()
    │   └── ...
    ├── transactionsAPI
    │   ├── list()
    │   ├── create()
    │   ├── update()
    │   ├── delete()
    │   ├── parseSMS()
    │   └── ...
    ├── accountsAPI
    ├── categoriesAPI
    ├── analyticsAPI
    └── postsAPI
```

---

## 🛠️ Обновление существующих компонентов

### Пример: Обновление ExpensesPage

**Было (localStorage):**
```javascript
const [days, setDays] = useState(user?.days || []);
```

**Стало (API):**
```javascript
import { transactionsAPI } from '../api/client';

const [transactions, setTransactions] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadTransactions = async () => {
    try {
      const response = await transactionsAPI.list();
      setTransactions(response.data.results);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  loadTransactions();
}, []);
```

---

## ⚠️ Возможные проблемы и решения

### 1. CORS Error

**Ошибка:**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/v1/auth/login/' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Решение:**
Проверить `backend/config/settings/development.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
]
CORS_ALLOW_CREDENTIALS = True
```

### 2. 401 Unauthorized

**Ошибка:**
```
Response 401: Учетные данные не были предоставлены
```

**Решение:**
Проверить наличие токена:
```javascript
const token = localStorage.getItem('access_token');
console.log('Token:', token); // Должен быть
```

### 3. Token не обновляется

**Проблема:**
Refresh Token не работает

**Решение:**
Проверить Cookie:
```javascript
// В браузере (Console)
document.cookie // Должен содержать refresh_token
```

Проверить настройки в `backend/config/settings/base.py`:
```python
SIMPLE_JWT = {
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

---

## 📋 Чеклист интеграции

- [x] Установлен axios
- [x] Создан API клиент (`src/api/client.js`)
- [x] Обновлён AuthContext
- [x] Обновлён AuthModal
- [x] Настроен `.env` с API URL
- [x] CORS настроен на бэкенде
- [ ] Обновлены страницы для работы с API
- [ ] Протестирована регистрация/вход
- [ ] Протестировано создание транзакций
- [ ] Протестирована аналитика

---

## 🎯 Следующие шаги

1. **Обновить ExpensesPage** для работы с `transactionsAPI`
2. **Создать страницу аналитики** с `analyticsAPI`
3. **Добавить страницу счетов** с `accountsAPI`
4. **Создать страницу категорий** с `categoriesAPI`
5. **Добавить социальный модуль** с `postsAPI`

---

**Дата:** 2026-02-18  
**Статус:** ✅ Базовая интеграция завершена
