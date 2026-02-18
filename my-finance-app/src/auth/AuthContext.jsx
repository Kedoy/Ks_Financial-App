import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authAPI } from "../api/client";

const USERS_KEY = "finance_users";
const CUR_KEY = "finance_current_user";
const TOKEN_KEY = "access_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Состояния для Django API
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Состояния для локального хранения (гостевой режим)
  const [users, setUsers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      console.error("Error loading users:", e);
      return [];
    }
  });

  const [currentUsername, setCurrentUsername] = useState(() => {
    try {
      return localStorage.getItem(CUR_KEY) || null;
    } catch (e) {
      console.error("Error loading current user:", e);
      return null;
    }
  });

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getProfile();
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Token validation failed:", error);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Обработчик ошибки аутентификации
  useEffect(() => {
    const handleAuthError = () => {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(TOKEN_KEY);
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  // Сохранение локальных пользователей
  const saveUsers = useCallback((u) => {
    setUsers(u);
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(u));
    } catch (e) {
      console.error("Error saving users:", e);
    }
  }, []);

  const getCurrentUser = useCallback(() =>
    users.find(u => u.username === currentUsername) || null,
    [users, currentUsername]
  );

  const updateCurrentUser = useCallback((patch) => {
    const u = getCurrentUser();
    if (!u) return false;

    const updated = { ...u, ...patch };
    const newUsers = users.map(x => x.username === u.username ? updated : x);
    saveUsers(newUsers);
    return true;
  }, [users, getCurrentUser, saveUsers]);

  // Вход через Django API
  const login = useCallback(async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { access_token, user: userData } = response.data;

      // Сохраняем токен и данные пользователя
      localStorage.setItem(TOKEN_KEY, access_token);
      setUser(userData);
      setIsAuthenticated(true);

      return { ok: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      return {
        ok: false,
        message: error.response?.data?.detail || "Ошибка входа"
      };
    }
  }, []);

  // Выход
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setIsAuthenticated(false);
    }
    return true;
  }, []);

  // Регистрация через Django API
  const register = useCallback(async (email, password, guestData = null) => {
    if (!email || !password) {
      return { ok: false, message: "Введите email и пароль" };
    }

    try {
      const response = await authAPI.register({
        email,
        password,
        password_confirm: password,
        username: email.split('@')[0],
      });

      const { access_token, user: userData } = response.data;

      // Сохраняем токен и данные пользователя
      localStorage.setItem(TOKEN_KEY, access_token);
      setUser(userData);
      setIsAuthenticated(true);

      // Если есть гостевые данные, можно предложить перенос
      if (guestData && guestData.days?.length > 0) {
        // Здесь можно добавить миграцию данных на сервер
        console.log("Guest data available for migration:", guestData);
      }

      return {
        ok: true,
        user: userData,
        message: "Аккаунт успешно создан"
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        ok: false,
        message: error.response?.data?.email?.[0] || "Ошибка регистрации"
      };
    }
  }, []);

  // Остальные методы для гостевого режима
  const migrateGuestData = useCallback((guestDays = [], guestCategories = []) => {
    const u = getCurrentUser();
    if (!u) return { ok: false, message: "Пользователь не авторизован" };

    console.log("Migrating guest data to user:", u.username);
    console.log("Guest days:", guestDays.length);
    console.log("Guest categories:", guestCategories.length);

    let updatedDays = [...(u.days || [])];
    let updatedCategories = [...(u.categories || [])];

    // Объединяем дни (уникальные по дате)
    if (guestDays.length > 0) {
      const existingDates = new Set(updatedDays.map(day => day.date));
      const newDays = guestDays.filter(day => !existingDates.has(day.date));

      if (newDays.length > 0) {
        updatedDays = [...updatedDays, ...newDays]
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log(`Added ${newDays.length} new days`);
      }
    }

    // Объединяем категории (уникальные)
    if (guestCategories.length > 0) {
      const existingCats = new Set(updatedCategories);
      const newCats = guestCategories.filter(cat => !existingCats.has(cat));

      if (newCats.length > 0) {
        updatedCategories = [...updatedCategories, ...newCats];
        console.log(`Added ${newCats.length} new categories`);
      }
    }

    const success = updateCurrentUser({
      days: updatedDays,
      categories: updatedCategories
    });

    return {
      ok: success,
      message: success ?
        `Перенесено: ${guestDays.length} дней, ${guestCategories.length} категорий` :
        "Ошибка при переносе данных"
    };
  }, [getCurrentUser, updateCurrentUser]);

  const updateUserExpenses = useCallback((newDays) => {
    return updateCurrentUser({ days: newDays });
  }, [updateCurrentUser]);

  const updateUserCategories = useCallback((newCategories) => {
    return updateCurrentUser({ categories: newCategories });
  }, [updateCurrentUser]);

  const getGuestData = useCallback(() => {
    try {
      const days = JSON.parse(localStorage.getItem("expenses_guest")) || [];
      const categories = JSON.parse(localStorage.getItem("guest_categories")) || ["Еда", "Дом"];
      return { days, categories };
    } catch (e) {
      console.error("Error loading guest data:", e);
      return { days: [], categories: ["Еда", "Дом"] };
    }
  }, []);

  const clearGuestData = useCallback(() => {
    try {
      localStorage.removeItem("expenses_guest");
      localStorage.removeItem("guest_categories");
      return true;
    } catch (e) {
      console.error("Error clearing guest data:", e);
      return false;
    }
  }, []);

  useEffect(() => {
    if (currentUsername && !users.find(u => u.username === currentUsername)) {
      console.warn("User no longer exists, logging out");
      setCurrentUsername(null);
    }
  }, [users, currentUsername]);

  return (
    <AuthContext.Provider value={{
      // Django API
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      register,
      
      // Гостевой режим (локальное хранение)
      users,
      currentUsername,
      localUser: getCurrentUser(),
      saveUsers,
      updateCurrentUser,
      migrateGuestData,
      updateUserExpenses,
      updateUserCategories,
      getGuestData,
      clearGuestData,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
