import React, { useState, useEffect } from "react";
import ExpensesPage from "./pages/ExpensesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TestPage from "./pages/TestPage";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import { AuthProvider, useAuth } from "./auth/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();
  const storageKey = user ? `expenses_${user.username}` : "expenses_guest";
  const [currentPage, setCurrentPage] = useState("expenses");
  const [days, setDays] = useState([]);

  useEffect(() => {
    const key = user ? `expenses_${user.username}` : "expenses_guest";
    const data = JSON.parse(localStorage.getItem(key)) || [];
    setDays(data);
  }, [user]);

  const updateDays = (newDays) => {
    const key = user ? `expenses_${user.username}` : "expenses_guest";
    setDays(newDays);
    localStorage.setItem(key, JSON.stringify(newDays));
  };

  const renderPage = () => {
    switch (currentPage) {
      case "expenses":
        return <ExpensesPage days={days} setDays={updateDays} />;
      case "analytics":
        return <AnalyticsPage days={days} />;
      case "test":
        return <TestPage days={days} />;
      default:
        return <ExpensesPage days={days} setDays={updateDays} />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>

      {/* Header сверху */}
      <Header />

      <div style={{ display: "flex", flex: 1 }}>
        
        {/* Sidebar слева */}
        <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />

        {/* Контентная область */}
        <div
          style={{
            position: "absolute",
            top: "70px", // чтобы не залезало под хедер
            left: "50%", // центр всего окна
            transform: "translateX(-50%)", // выравниваем центр
            paddingLeft: "110px", // половина ширины sidebar (220 / 2)
            width: "100%",
            maxWidth: "900px",
            boxSizing: "border-box",
          }}
        >
          {renderPage()}
        </div>

      </div>
    </div>
  );
}
