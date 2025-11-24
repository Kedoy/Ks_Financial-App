import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import AuthModal from './AuthModal';

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header style={{position: 'fixed', top:0, left:0, right:0, height:60, display:'flex', alignItems:'center', justifyContent:'space-between', padding: '0 20px', background: '#222', color:'#fff', zIndex:1000}}>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <span style={{fontSize:24}}>₽</span>
          <strong>Финансовый Помощник</strong>
        </div>

        <div>
          {user ? (
            <>
              <span style={{marginRight:12}}>Привет, {user.username}</span>
              <button onClick={logout}>Выйти</button>
            </>
          ) : (
            <>
              <button onClick={()=>setOpen(true)} style={{marginRight:8}}>Войти / Регистрация</button>
            </>
          )}
        </div>
      </header>

      <AuthModal open={open} onClose={()=>setOpen(false)} />
    </>
  );
}
