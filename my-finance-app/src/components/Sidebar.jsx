import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar({ onNavigate, currentPage }) {
  const [indicatorPos, setIndicatorPos] = useState(0);
  const [indicatorHeight, setIndicatorHeight] = useState(0);
  const buttonsRef = useRef({});
  const { user } = useAuth();

  // Полный список страниц
  const allPages = [
    { key: "expenses", label: "Главная", always: true },
    { key: "analytics", label: "Аналитика", authOnly: true },
    { key: "test", label: "Тест", authOnly: true },
    { key: "game", label: "Мини-игра", always: true },
    { key: "about", label: "О проекте", always: true }
  ];

  // Фильтрация согласно авторизации
  const pages = allPages.filter(p => p.always || (p.authOnly && user));

  useEffect(() => {
    const btn = buttonsRef.current[currentPage];
    if (btn) {
      setIndicatorPos(btn.offsetTop);
      setIndicatorHeight(btn.offsetHeight);
    }
  }, [currentPage, pages]);

  return (
    <div
      style={{
        width: "220px",
        background: "#1f1f1fff",
        padding: "70px 0",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        boxSizing: "border-box",
        overflow: "hidden"
      }}
    >
      {/* активный индикатор */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: indicatorPos,
          width: "5px",
          height: indicatorHeight,
          background: "#4a90e2",
          borderRadius: "0 4px 4px 0",
          transition: "top 0.25s ease, height 0.25s ease"
        }}
      />

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {pages.map(({ key, label }) => (
          <li key={key}>
            <button
              ref={el => (buttonsRef.current[key] = el)}
              onClick={() => onNavigate(key)}
              style={{
                width: "100%",
                padding: "14px 20px",
                margin: 0,
                background:
                  currentPage === key ? "rgba(255,255,255,0.08)" : "transparent",
                color: "white",
                border: "none",
                textAlign: "left",
                fontSize: "16px",
                cursor: "pointer",
                transition: "background 0.25s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background =
                  currentPage === key
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background =
                  currentPage === key
                    ? "rgba(255,255,255,0.08)"
                    : "transparent";
              }}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
