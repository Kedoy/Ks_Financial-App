# Фронтенд (React)

## Обзор

Фронтенд приложения построен на **React 18** с использованием **Vite** и **TailwindCSS**.

### Структура

```
my-finance-app/
├── src/
│   ├── components/
│   │   ├── analytics/
│   │   │   ├── SummaryCards.jsx
│   │   │   ├── CategoryPieChart.jsx
│   │   │   ├── TimeBarChart.jsx
│   │   │   └── useAnalyticsData.js
│   │   ├── AIInsights.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Analytics.jsx
│   │   ├── Transactions.jsx
│   │   └── ...
│   ├── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── AuthContext.jsx
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Компоненты

### AIInsights

Компонент AI рекомендаций.

**Расположение:** `src/components/AIInsights.jsx`

**Пропсы:**
- `days` (number, default: 30) — период анализа

**Состояние:**
- `loading` — загрузка
- `insights` — массив рекомендаций
- `summary` — сводка (доходы/расходы/баланс)
- `error` — ошибка

**Пример использования:**
```jsx
import AIInsights from '../components/AIInsights';

function Analytics() {
  return <AIInsights days={30} />;
}
```

### useAnalyticsData

Хук для получения данных аналитики.

**Расположение:** `src/components/analytics/useAnalyticsData.js`

**Параметры:**
- `transactionType` — тип транзакций (expense/income)
- `timePeriod` — период (day/week/month)
- `selectedDate` — выбранная дата

**Возвращает:**
- `loading` — загрузка
- `categoryStats` — статистика по категориям
- `chartData` — данные для графика
- `summary` — сводка

## API Клиент

**Расположение:** `src/api.js`

### analyticsAPI

```javascript
export const analyticsAPI = {
  summary: (days = 30) => api.get('/analytics/summary/', { params: { days } }),
  aiInsights: (days = 30) => api.get('/analytics/ai-insights/', { params: { days } }),
};
```

### Использование

```javascript
import { analyticsAPI } from '../api';

async function loadInsights() {
  const response = await analyticsAPI.aiInsights(30);
  console.log(response.data);
}
```

## Стили

### TailwindCSS

Конфигурация в `tailwind.config.js`:

```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#7C3AED',
      },
    },
  },
  plugins: [],
};
```

### Компоненты с Tailwind

```jsx
<div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-sm p-6">
  <h2 className="text-xl font-bold text-gray-900">AI Рекомендации</h2>
</div>
```

## Аутентификация

### AuthContext

**Расположение:** `src/AuthContext.jsx`

```javascript
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    localStorage.setItem('access_token', response.data.access_token);
    setUser(response.data.user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Использование

```jsx
import { useAuth } from './AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Роутинг

**Расположение:** `src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Login from './pages/Login';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

## Запуск

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```
