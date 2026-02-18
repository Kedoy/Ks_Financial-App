/**
 * API Client для подключения к Django бэкенду
 */

import axios from 'axios';

// Базовый URL API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Создаём axios инстанс
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Для отправки cookies
});

// Интерцептор для добавления токена
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ошибок (например, истёкший токен)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и мы ещё не пытались обновить токен
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Пытаемся обновить токен через cookie
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.access_token;
        localStorage.setItem('access_token', newAccessToken);

        // Повторяем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Не удалось обновить токен - выходим
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-error'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Экспортируем методы для работы с API
export const authAPI = {
  // Регистрация
  register: (data) => apiClient.post('/auth/register/', data),
  
  // Вход
  login: (email, password) => apiClient.post('/auth/login/', { email, password }),
  
  // Выход
  logout: () => apiClient.post('/auth/logout/'),
  
  // Получение профиля
  getProfile: () => apiClient.get('/auth/me/'),
  
  // Обновление профиля
  updateProfile: (data) => apiClient.put('/auth/profile/', data),
  
  // Сброс пароля (запрос)
  requestPasswordReset: (email) => apiClient.post('/auth/password/reset/', { email }),
  
  // Сброс пароля (подтверждение)
  confirmPasswordReset: (token, password, password_confirm) =>
    apiClient.post('/auth/password/reset/confirm/', { token, password, password_confirm }),
};

export const transactionsAPI = {
  // Получить список транзакций
  list: (params) => apiClient.get('/transactions/', { params }),
  
  // Создать транзакцию
  create: (data) => apiClient.post('/transactions/', data),
  
  // Получить транзакцию
  get: (id) => apiClient.get(`/transactions/${id}/`),
  
  // Обновить транзакцию
  update: (id, data) => apiClient.put(`/transactions/${id}/`, data),
  
  // Удалить транзакцию
  delete: (id) => apiClient.delete(`/transactions/${id}/`),
  
  // Парсинг SMS
  parseSMS: (sms_text, bank_phone) => apiClient.post('/transactions/sms-parse/', { sms_text, bank_phone }),
  
  // Массовое создание
  bulk: (transactions) => apiClient.post('/transactions/bulk/', { transactions }),
  
  // Статистика по категориям
  statsByCategory: (params) => apiClient.get('/transactions/stats/by-category/', { params }),
  
  // Месячная статистика
  statsMonthly: (months = 6) => apiClient.get('/transactions/stats/monthly/', { params: { months } }),
  
  // Дневная статистика
  statsDaily: (days = 30) => apiClient.get('/transactions/stats/daily/', { params: { days } }),
};

export const accountsAPI = {
  // Получить список счетов
  list: (params) => apiClient.get('/accounts/', { params }),
  
  // Создать счёт
  create: (data) => apiClient.post('/accounts/', data),
  
  // Получить счёт
  get: (id) => apiClient.get(`/accounts/${id}/`),
  
  // Обновить счёт
  update: (id, data) => apiClient.put(`/accounts/${id}/`, data),
  
  // Удалить счёт
  delete: (id) => apiClient.delete(`/accounts/${id}/`),
  
  // Транзакции счёта
  getTransactions: (id) => apiClient.get(`/accounts/${id}/transactions/`),
};

export const categoriesAPI = {
  // Получить все категории
  list: (params) => apiClient.get('/categories/', { params }),
  
  // Создать категорию
  create: (data) => apiClient.post('/categories/', data),
  
  // Обновить категорию
  update: (id, data) => apiClient.put(`/categories/${id}/`, data),
  
  // Удалить категорию
  delete: (id) => apiClient.delete(`/categories/${id}/`),
  
  // Системные категории
  getSystem: () => apiClient.get('/categories/system/'),
  
  // Пользовательские категории
  getMy: () => apiClient.get('/categories/my/'),
};

export const analyticsAPI = {
  // Общая сводка
  summary: (days = 30) => apiClient.get('/analytics/summary/', { params: { days } }),
  
  // Дневная статистика
  daily: (days = 30) => apiClient.get('/analytics/daily/', { params: { days } }),
  
  // Месячная статистика
  monthly: (months = 12) => apiClient.get('/analytics/monthly/', { params: { months } }),
};

export const postsAPI = {
  // Лента постов
  list: (params) => apiClient.get('/posts/', { params }),
  
  // Персональная лента
  getFeed: () => apiClient.get('/posts/feed/'),
  
  // Создать пост
  create: (data) => apiClient.post('/posts/', data),
  
  // Получить пост
  get: (id) => apiClient.get(`/posts/${id}/`),
  
  // Обновить пост
  update: (id, data) => apiClient.put(`/posts/${id}/`, data),
  
  // Удалить пост
  delete: (id) => apiClient.delete(`/posts/${id}/`),
  
  // Лайк
  like: (id) => apiClient.post(`/posts/${id}/like/`),
  
  // Убрать лайк
  unlike: (id) => apiClient.post(`/posts/${id}/unlike/`),
  
  // Комментарии (GET/POST)
  getComments: (id) => apiClient.get(`/posts/${id}/comments/`),
  addComment: (id, body) => apiClient.post(`/posts/${id}/comments/`, { body }),
};

export default apiClient;
