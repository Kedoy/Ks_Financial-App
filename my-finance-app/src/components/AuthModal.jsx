import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function AuthModal({ open, onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // or 'register'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleSubmit = () => {
    setError(null);
    if (mode === "login") {
      const res = login(username.trim(), password);
      if (!res.ok) setError(res.message);
      else onClose();
    } else {
      const res = register(username.trim(), password);
      if (!res.ok) setError(res.message);
      else onClose();
    }
  };

  return (
    <div style={{position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', zIndex:2000}}>
      <div style={{width: 360, background: '#423a3aff', padding: 20, borderRadius: 8}}>
        <h3 style={{marginTop:0}}>{mode === 'login' ? 'Войти' : 'Регистрация'}</h3>

        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <input placeholder="Логин" value={username} onChange={e=>setUsername(e.target.value)} />
          <input placeholder="Пароль" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {error && <div style={{color: 'red'}}>{error}</div>}

          <div style={{display: 'flex', gap: 8, marginTop: 6}}>
            <button onClick={handleSubmit}>{mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</button>
            <button onClick={onClose}>Отмена</button>
          </div>

          <div style={{marginTop: 8}}>
            {mode === 'login' ? (
              <div>Нет аккаунта? <button onClick={()=>{setMode('register'); setError(null);}}>Зарегистрироваться</button></div>
            ) : (
              <div>Есть аккаунт? <button onClick={()=>{setMode('login'); setError(null);}}>Войти</button></div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
