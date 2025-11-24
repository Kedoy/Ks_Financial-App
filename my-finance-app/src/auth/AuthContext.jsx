import React, { createContext, useContext, useEffect, useState } from "react";

const USERS_KEY = "finance_users"; // массив пользователей
const CUR_KEY = "finance_current_user"; // username текущей сессии

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  });

  const [currentUsername, setCurrentUsername] = useState(() => {
    try {
      return localStorage.getItem(CUR_KEY) || null;
    } catch (e) {
      return null;
    }
  });

  // Помощники
  const saveUsers = (u) => {
    setUsers(u);
    localStorage.setItem(USERS_KEY, JSON.stringify(u));
  };

  const login = (username, password) => {
    const found = users.find(it => it.username === username && it.password === password);
    if (!found) return { ok: false, message: "Неверный логин или пароль" };
    setCurrentUsername(username);
    localStorage.setItem(CUR_KEY, username);
    return { ok: true };
  };

  const logout = () => {
    setCurrentUsername(null);
    localStorage.removeItem(CUR_KEY);
    window.location.reload();
  };

  const register = (username, password) => {
    if (!username || !password) return { ok: false, message: "Введите логин и пароль" };
    if (users.find(u => u.username === username)) return { ok: false, message: "Пользователь уже существует" };

    const newUser = {
      username,
      password,
      // структура данных пользователя: days — массив карточек
      days: []
    };
    const newUsers = [...users, newUser];
    saveUsers(newUsers);
    setCurrentUsername(username);
    localStorage.setItem(CUR_KEY, username);
    return { ok: true };
  };

  // Получить текущего юзера полностью
  const getCurrentUser = () => users.find(u => u.username === currentUsername) || null;

  // Обновить данные текущего пользователя (например, days)
  const updateCurrentUser = (patch) => {
    const u = getCurrentUser();
    if (!u) return;
    const updated = { ...u, ...patch };
    const newUsers = users.map(x => x.username === u.username ? updated : x);
    saveUsers(newUsers);
  };

  useEffect(() => {
    // если users поменялись и текущий пользователь не существует больше — логаут
    if (currentUsername && !users.find(u => u.username === currentUsername)) {
      logout();
    }
  }, [users]);

  return (
    <AuthContext.Provider value={{
      users,
      currentUsername,
      user: getCurrentUser(),
      login,
      logout,
      register,
      updateCurrentUser,
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