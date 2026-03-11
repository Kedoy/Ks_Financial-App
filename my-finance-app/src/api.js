import axios from 'axios';

const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
});

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  console.log('[API Interceptor] Request:', config.url, 'Token exists:', !!token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[API Interceptor] Added Authorization header');
  } else {
    console.warn('[API Interceptor] No access token found for request:', config.url);
  }

  // Не устанавливаем Content-Type вручную для FormData
  // браузер установит его автоматически с boundary
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login/', { email, password }),
  register: (data) => api.post('/auth/register/', data),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/auth/me/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
};

export const transactionsAPI = {
  list: (params) => api.get('/transactions/', { params }),
  create: (data) => api.post('/transactions/', data),
  update: (id, data) => api.put(`/transactions/${id}/`, data),
  delete: (id) => api.delete(`/transactions/${id}/`),
  statsByCategory: (params) => api.get('/transactions/stats/by-category/', { params }),
  monthlyStats: (months = 6) => api.get('/transactions/stats/monthly/', { params: { months } }),
  dailyStats: (days = 30) => api.get('/transactions/stats/daily/', { params: { days } }),
};

export const categoriesAPI = {
  list: () => api.get('/categories/'),
  system: () => api.get('/categories/system/'),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.put(`/categories/${id}/`, data),
  delete: (id) => api.delete(`/categories/${id}/`),
};

export const analyticsAPI = {
  summary: (days = 30) => api.get('/analytics/summary/', { params: { days } }),
  aiInsights: (days = 30) => api.get('/analytics/ai-insights/', { params: { days } }),
};

export const blogAPI = {
  posts: {
    list: (params) => api.get('/blog/posts/', { params }),
    create: (data) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('visibility', data.visibility || 'public');
      if (data.image) {
        formData.append('image', data.image);
      }
      // Для FormData заголовок Content-Type устанавливается браузером автоматически
      return api.post('/blog/posts/', formData);
    },
    get: (id) => api.get(`/blog/posts/${id}/`),
    update: (id, data) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('visibility', data.visibility || 'public');
      if (data.image) {
        formData.append('image', data.image);
      }
      // Для FormData заголовок Content-Type устанавливается браузером автоматически
      return api.put(`/blog/posts/${id}/`, formData);
    },
    delete: (id) => api.delete(`/blog/posts/${id}/`),
    like: (id) => api.post(`/blog/posts/${id}/like/`),
    unlike: (id) => api.post(`/blog/posts/${id}/unlike/`),
    comments: (id) => api.get(`/blog/posts/${id}/comments/`),
    addComment: (id, content) => api.post(`/blog/posts/${id}/add_comment/`, { content }),
  },
  profile: {
    get: () => api.get('/auth/profile/'),
    update: (data) => {
      // data может быть FormData или обычным объектом
      if (data instanceof FormData) {
        // Для FormData заголовок Content-Type устанавливается браузером автоматически (с boundary)
        return api.put('/auth/profile/', data);
      }
      return api.put('/auth/profile/', data, { headers: { 'Content-Type': 'application/json' } });
    },
  },
};

export default api;
