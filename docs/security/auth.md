# Аутентификация

## JWT Authentication

Приложение использует **JWT (JSON Web Tokens)** для аутентификации.

### Типы токенов

| Токен | Время жизни | Где хранится | Назначение |
|-------|-------------|--------------|------------|
| **Access Token** | 15 минут | localStorage | Доступ к API |
| **Refresh Token** | 7 дней | HttpOnly Cookie | Обновление Access |

### Flow аутентификации

```
┌─────────────┐                              ┌─────────────┐
│   Client    │                              │   Server    │
└──────┬──────┘                              └──────┬──────┘
       │                                            │
       │  POST /api/v1/auth/login/                  │
       │  {email, password}                         │
       │───────────────────────────────────────────>│
       │                                            │
       │  Verify credentials                        │
       │  Generate JWT tokens                       │
       │                                            │
       │  Set-Cookie: refresh_token (HttpOnly)     │
       │  {access_token, user}                      │
       │<───────────────────────────────────────────│
       │                                            │
       │  Store access_token in localStorage        │
       │                                            │
       │  API Requests with Authorization header   │
       │  Authorization: Bearer {access_token}     │
       │───────────────────────────────────────────>│
       │                                            │
       │  [Token Expired]                           │
       │                                            │
       │  POST /api/v1/auth/refresh/                │
       │  (Cookie: refresh_token)                  │
       │───────────────────────────────────────────>│
       │                                            │
       │  Validate refresh token                    │
       │  Generate new tokens                       │
       │                                            │
       │  Set-Cookie: new_refresh_token            │
       │  {new_access_token}                        │
       │<───────────────────────────────────────────│
```

## Реализация

### Бэкенд (Django)

**Файл:** `apps/accounts/views.py`

```python
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Вход пользователя с установкой Refresh Token в Cookie.
    POST /api/v1/auth/login/
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        # Устанавливаем Refresh Token в HttpOnly Cookie
        refresh_token = response.data.get('refresh')
        if refresh_token:
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=not settings.DEBUG,  # HTTPS только в production
                samesite='Lax',
                max_age=60*60*24*7,  # 7 дней
                path='/api/v1/auth/refresh/'
            )
            # Удаляем refresh из тела ответа для безопасности
            response.data.pop('refresh', None)
        
        return response

class CustomTokenRefreshView(TokenRefreshView):
    """
    Обновление токена из Cookie.
    POST /api/v1/auth/refresh/
    """
    def post(self, request, *args, **kwargs):
        # Берём refresh token из Cookie
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token не найден'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        request.data['refresh'] = refresh_token
        response = super().post(request, *args, **kwargs)
        
        # Обновляем Cookie с новым refresh token
        new_refresh_token = response.data.get('refresh')
        if new_refresh_token:
            response.set_cookie(
                key='refresh_token',
                value=new_refresh_token,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                max_age=60*60*24*7,
                path='/api/v1/auth/refresh/'
            )
            response.data.pop('refresh', None)
        
        return response
```

### Фронтенд (React)

**Файл:** `src/AuthContext.jsx`

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    
    // Access token сохраняем в localStorage
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    setUser(response.data.user);
  };

  const logout = async () => {
    await api.post('/auth/logout/');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/auth/me/')
        .then(response => setUser(response.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Файл:** `src/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
});

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Настройки безопасности

### Django Settings

**Файл:** `config/settings/base.py`

```python
# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Cookie settings for security
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SAMESITE = 'Lax'

# CORS settings
CORS_ALLOWED_ORIGINS = ['http://localhost:5173']
CORS_ALLOW_CREDENTIALS = True
```

## API Endpoints

### Login

```bash
POST /api/v1/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user"
  }
}

Set-Cookie: refresh_token=eyJ0eXAiOiJKV1QiLCJhbGc...; 
  HttpOnly; 
  Secure; 
  SameSite=Lax; 
  Max-Age=604800; 
  Path=/api/v1/auth/refresh/
```

### Refresh

```bash
POST /api/v1/auth/refresh/
Cookie: refresh_token=eyJ0eXAiOiJKV1QiLCJhbGc...

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Set-Cookie: refresh_token=new_refresh_token...
```

### Logout

```bash
POST /api/v1/auth/logout/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

Response:
{
  "message": "Successfully logged out"
}
```

## Безопасность

### XSS Protection

- **Access Token** в localStorage (уязвим для XSS)
- **Refresh Token** в HttpOnly Cookie (защищён от XSS)
- Даже если XSS украдёт access token, он действителен только 15 минут

### CSRF Protection

- Refresh token передаётся только на `/api/v1/auth/refresh/`
- CSRF cookie HttpOnly
- SameSite=Lax для cookies

### Recommendations

1. **HTTPS** в production
2. **Secure flag** для cookies
3. **CORS** с конкретными origin
4. **Rate limiting** для login endpoint
5. **Password hashing** (bcrypt/argon2)
