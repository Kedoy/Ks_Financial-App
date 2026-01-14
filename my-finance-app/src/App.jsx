import React, { useState, useEffect } from "react";
import ExpensesPage from "./pages/ExpensesPage";
import TestPage from "./pages/TestPage";
import AboutPage from "./pages/About";
import Game from "./pages/Game";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";

import { AuthProvider, useAuth } from "./auth/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, updateUserExpenses, migrateGuestData } = useAuth();
  const [currentPage, setCurrentPage] = useState("expenses");
  const [days, setDays] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" или "register"

  // Загружаем данные при монтировании и при смене пользователя
  useEffect(() => {
    if (user) {
      // Авторизованный пользователь: берём данные из его объекта
      setDays(user.days || []);
    } else {
      // Гостевая сессия: берём из отдельного хранилища
      try {
        const guestData = JSON.parse(localStorage.getItem("expenses_guest")) || [];
        setDays(guestData);
      } catch (error) {
        console.error("Ошибка загрузки гостевых данных:", error);
        setDays([]);
      }
    }
  }, [user]);

  // Основная функция обновления дней
  const updateDays = (newDays) => {
    setDays(newDays);
    
    if (user) {
      // Авторизованный пользователь: сохраняем в его данные
      updateUserExpenses(newDays);
    } else {
      // Гостевая сессия: сохраняем в localStorage
      try {
        localStorage.setItem("expenses_guest", JSON.stringify(newDays));
      } catch (error) {
        console.error("Ошибка сохранения гостевых данных:", error);
      }
    }
  };

  // Функция для переноса данных при регистрации/входе
  const handleAuthWithDataMigration = async (username, password, mode) => {
    const guestDays = JSON.parse(localStorage.getItem("expenses_guest")) || [];
    const hasGuestData = guestDays.length > 0;
    
    if (mode === "register") {
      // При регистрации сразу предлагаем перенести данные
      if (hasGuestData && window.confirm("У вас есть данные в гостевом режиме. Перенести их в ваш новый аккаунт?")) {
        // Сохраняем гостевые данные в локальную переменную
        const savedGuestData = [...guestDays];
        localStorage.removeItem("expenses_guest");
        // Показываем модалку регистрации
        setAuthMode("register");
        setShowAuthModal(true);
        return { hasGuestData: true, guestData: savedGuestData };
      }
    } else if (mode === "login") {
      // При входе тоже можно предложить перенос
      if (hasGuestData && window.confirm("У вас есть данные в гостевом режиме. Объединить их с вашим аккаунтом?")) {
        const savedGuestData = [...guestDays];
        localStorage.removeItem("expenses_guest");
        setAuthMode("login");
        setShowAuthModal(true);
        return { hasGuestData: true, guestData: savedGuestData };
      }
    }
    
    return { hasGuestData: false, guestData: [] };
  };

  const renderPage = () => {
    switch (currentPage) {
      case "expenses":
        return <ExpensesPage days={days} setDays={updateDays} />;
      case "test":
        return <TestPage days={days} />;
      case "game":
        return <Game />;
      case "about":
        return <AboutPage />;
      default:
        return <ExpensesPage days={days} setDays={updateDays} />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw" }}>
      {/* Header сверху */}
      <Header />

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar слева */}
        <Sidebar 
          onNavigate={setCurrentPage} 
          currentPage={currentPage}
          onAuthRequest={(mode) => {
            setAuthMode(mode);
            setShowAuthModal(true);
          }}
        />

        {/* Контентная область */}
        <div
          style={{
            flex: 1,
            display: "flex",
            marginLeft: "300px",
            width: "calc(100% - 300px)"
          }}
        >
          {renderPage()}
        </div>

      </div>

      {/* Модальное окно аутентификации */}
      <AuthModal 
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSuccess={() => {
          // После успешной аутентификации можно перенести гостевые данные
          const guestDays = JSON.parse(localStorage.getItem("expenses_guest")) || [];
          if (guestDays.length > 0 && user) {
            migrateGuestData(guestDays);
            localStorage.removeItem("expenses_guest");
          }
          setShowAuthModal(false);
        }}
      />
    </div>
  );
}