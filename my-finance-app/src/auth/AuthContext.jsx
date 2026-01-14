import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const USERS_KEY = "finance_users";
const CUR_KEY = "finance_current_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
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

  const login = useCallback((username, password) => {
    const found = users.find(it => it.username === username && it.password === password);
    if (!found) return { ok: false, message: "Неверный логин или пароль" };
    
    setCurrentUsername(username);
    try {
      localStorage.setItem(CUR_KEY, username);
    } catch (e) {
      console.error("Error saving session:", e);
    }
    
    return { ok: true };
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUsername(null);
    try {
      localStorage.removeItem(CUR_KEY);
    } catch (e) {
      console.error("Error clearing session:", e);
    }
    // Не перезагружаем страницу, чтобы сохранить состояние
    return true;
  }, []);

  const register = useCallback((username, password, guestData = null) => {
    if (!username || !password) {
      return { ok: false, message: "Введите логин и пароль" };
    }
    
    if (users.find(u => u.username === username)) {
      return { ok: false, message: "Пользователь уже существует" };
    }

    // Стандартные категории
    const defaultCategories = ["Еда", "Дом", "Транспорт", "Развлечения"];
    
    // Если есть гостевые данные, объединяем с ними
    let initialDays = [];
    let initialCategories = [...defaultCategories];
    
    if (guestData) {
      initialDays = guestData.days || [];
      
      // Объединяем категории, убираем дубликаты
      const guestCategories = guestData.categories || [];
      initialCategories = [...new Set([...defaultCategories, ...guestCategories])];
    }

    const newUser = {
      username,
      password,
      days: initialDays,
      categories: initialCategories
    };

    const newUsers = [...users, newUser];
    saveUsers(newUsers);
    setCurrentUsername(username);
    
    try {
      localStorage.setItem(CUR_KEY, username);
    } catch (e) {
      console.error("Error saving session:", e);
    }
    
    return { 
      ok: true, 
      message: guestData ? 
        `Аккаунт создан с ${initialDays.length} днями расходов` : 
        "Аккаунт успешно создан" 
    };
  }, [users, saveUsers]);

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

    // Сохраняем обновлённые данные
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

  // Получить гостевые данные (для использования в UI)
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

  // Очистить гостевые данные
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
    // Если текущий пользователь удалён из системы - выходим
    if (currentUsername && !users.find(u => u.username === currentUsername)) {
      console.warn("User no longer exists, logging out");
      logout();
    }
  }, [users, currentUsername, logout]);

  return (
    <AuthContext.Provider value={{
      users,
      currentUsername,
      user: getCurrentUser(),
      login,
      logout,
      register,
      migrateGuestData,
      updateCurrentUser,
      updateUserExpenses,
      updateUserCategories,
      getGuestData,
      clearGuestData,
      saveUsers
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