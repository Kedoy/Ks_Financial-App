import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

export default function AuthModal({ open, onClose, mode: initialMode = "login", onSuccess }) {
  const { login, register, migrateGuestData, getGuestData, clearGuestData } = useAuth();

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [guestDataInfo, setGuestDataInfo] = useState({ hasData: false, days: 0 });

  // Проверяем гостевые данные при открытии
  useEffect(() => {
    if (open) {
      const { days } = getGuestData();
      setGuestDataInfo({
        hasData: days.length > 0,
        days: days.length
      });
    }
  }, [open, getGuestData]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    setError(null);
    setIsProcessing(true);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Введите email и пароль");
      setIsProcessing(false);
      return;
    }

    if (mode === "login") {
      // ВХОД через Django API
      const res = await login(trimmedEmail, password);

      if (!res.ok) {
        setError(res.message || "Неверный email или пароль");
        setIsProcessing(false);
        return;
      }

      // Проверяем гостевые данные после входа
      const { days, categories } = getGuestData();
      if (days.length > 0) {
        const shouldMigrate = window.confirm(
          `У вас есть ${days.length} дней с расходами в гостевом режиме.\n` +
          `Хотите перенести их в аккаунт "${trimmedEmail}"?`
        );

        if (shouldMigrate) {
          migrateGuestData(days, categories);
          clearGuestData();
        }
      }

      onSuccess?.();
      onClose();

    } else {
      // РЕГИСТРАЦИЯ через Django API
      const { days, categories } = getGuestData();

      // Регистрируем с гостевыми данными (если они есть)
      const guestData = days.length > 0 ? { days, categories } : null;
      const res = await register(trimmedEmail, password, guestData);

      if (!res.ok) {
        setError(res.message || "Ошибка при регистрации");
        setIsProcessing(false);
        return;
      }

      // Очищаем гостевые данные после успешной регистрации
      if (days.length > 0) {
        clearGuestData();
        alert(`✅ Аккаунт создан!\nПеренесено ${days.length} дней с расходами`);
      }

      onSuccess?.();
      onClose();
    }

    setIsProcessing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={{
      position: 'fixed', 
      inset: 0, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'rgba(0,0,0,0.85)', 
      zIndex: 2000
    }}>
      <div style={{
        width: 400, 
        background: '#1a1a1a', 
        padding: 24, 
        borderRadius: 12,
        border: '1px solid #333'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: '#fff' }}>
            {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              fontSize: '24px',
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {mode === 'register' && guestDataInfo.hasData && (
          <div style={{
            marginBottom: 16,
            padding: '10px 12px',
            background: 'rgba(74, 144, 226, 0.1)',
            border: '1px solid rgba(74, 144, 226, 0.3)',
            borderRadius: '6px',
            color: '#4a90e2',
            fontSize: '14px'
          }}>
            📦 При регистрации перенесём {guestDataInfo.days} дней с расходами
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #444',
                background: '#2a2a2a',
                color: '#fff',
                fontSize: '16px'
              }}
              disabled={isProcessing}
              autoFocus
            />

            <input
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #444',
                background: '#2a2a2a',
                color: '#fff',
                fontSize: '16px'
              }}
              disabled={isProcessing}
            />
            
            {error && (
              <div style={{
                color: '#ff6b6b',
                background: 'rgba(255, 107, 107, 0.1)',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button 
                type="submit"
                disabled={isProcessing}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#4a90e2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
              <button 
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px',
                  background: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </form>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #333', color: '#999', textAlign: 'center' }}>
          {mode === 'login' ? (
            <div>
              Нет аккаунта?{' '}
              <button 
                onClick={() => { setMode('register'); setError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4a90e2',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Зарегистрироваться
              </button>
            </div>
          ) : (
            <div>
              Есть аккаунт?{' '}
              <button 
                onClick={() => { setMode('login'); setError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4a90e2',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Войти
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}