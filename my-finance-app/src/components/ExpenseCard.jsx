import React, { useState, useRef, useEffect, useCallback } from "react";
import ExpenseItem from "./ExpenseItem";
import { useAuth } from "../auth/AuthContext";

export default function ExpenseCard({ dayData, updateDay }) {
  const { user } = useAuth();
  const [creating, setCreating] = useState(null);
  const [openCats, setOpenCats] = useState({});
  const contentRefs = useRef({});

  // Локальное состояние категорий - НЕ синхронизируем постоянно!
  const [localCategories, setLocalCategories] = useState(() => {
    if (user) {
      // Авторизованный пользователь: категории из его данных
      return user.categories || ["Еда", "Дом", "Транспорт", "Развлечения"];
    } else {
      // Гостевая сессия: из localStorage
      try {
        const guestCats = localStorage.getItem("guest_categories");
        return guestCats ? JSON.parse(guestCats) : ["Еда", "Дом"];
      } catch {
        return ["Еда", "Дом"];
      }
    }
  });

  // Обновляем категории только при смене пользователя
  useEffect(() => {
    if (user) {
      setLocalCategories(user.categories || ["Еда", "Дом", "Транспорт", "Развлечения"]);
    } else {
      try {
        const guestCats = localStorage.getItem("guest_categories");
        setLocalCategories(guestCats ? JSON.parse(guestCats) : ["Еда", "Дом"]);
      } catch {
        setLocalCategories(["Еда", "Дом"]);
      }
    }
  }, [user]); // ТОЛЬКО при смене пользователя!

  const grouped = dayData.expenses.reduce((acc, exp) => {
    if (!acc[exp.category]) acc[exp.category] = [];
    acc[exp.category].push(exp);
    return acc;
  }, {});

  const orderedCategories = (() => {
    const keys = Object.keys(grouped);
    if (
      creating &&
      creating.stage === "details" &&
      creating.category &&
      creating.category !== "new" &&
      !keys.includes(creating.category)
    ) {
      return [...keys, creating.category];
    }
    return keys;
  })();

  // Проверяем, существует ли категория создания
  useEffect(() => {
    if (!creating) return;
    if (creating.category === "new") return;
    if (creating.category && !localCategories.includes(creating.category)) {
      setCreating(null);
    }
  }, [localCategories, creating]);

  const toggleCategory = (cat) => setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }));

  const startCreateInCategory = (cat) => {
    setCreating({
      stage: "details",
      category: cat,
      newCategoryName: "",
      name: "",
      amount: ""
    });
    setOpenCats(prev => ({ ...prev, [cat]: true }));
    const el = contentRefs.current[cat];
    if (el && typeof el.scrollIntoView === "function") {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  };

  const startCreateNew = () => {
    if (creating && creating.stage === "choose") {
      setCreating(null);
    } else {
      setCreating({
        stage: "choose",
        category: "",
        newCategoryName: "",
        name: "",
        amount: ""
      });
    }
  };

  const cancelCreating = () => setCreating(null);

  // Функция сохранения новой категории
  const saveNewCategoryToStorage = useCallback((categoryName) => {
    if (user) {
      // Для авторизованного пользователя
      const { updateCurrentUser } = useAuth();
      const currentCategories = user.categories || ["Еда", "Дом", "Транспорт", "Развлечения"];
      if (!currentCategories.includes(categoryName)) {
        const newCategories = [...currentCategories, categoryName];
        updateCurrentUser({ categories: newCategories });
      }
    } else {
      // Для гостевой сессии
      try {
        const currentGuestCats = JSON.parse(localStorage.getItem("guest_categories")) || ["Еда", "Дом"];
        if (!currentGuestCats.includes(categoryName)) {
          const newGuestCats = [...currentGuestCats, categoryName];
          localStorage.setItem("guest_categories", JSON.stringify(newGuestCats));
        }
      } catch (e) {
        console.error("Error saving guest category:", e);
      }
    }
  }, [user]);

  const saveExpense = () => {
    if (!creating) return;

    let finalCategory = creating.category;

    if (creating.category === "new") {
      const name = (creating.newCategoryName || "").trim();
      if (!name) {
        alert("Введите имя новой категории");
        return;
      }
      finalCategory = name;
      
      // Добавляем в локальные категории если ещё нет
      if (!localCategories.includes(name)) {
        const newCategories = [...localCategories, name];
        setLocalCategories(newCategories);
        
        // Сохраняем категорию в хранилище
        saveNewCategoryToStorage(name);
      }
    }

    if (!creating.name || creating.name.trim() === "") {
      alert("Введите название расхода");
      return;
    }
    
    if (!creating.amount || Number.isNaN(Number(creating.amount))) {
      alert("Введите корректную сумму");
      return;
    }

    // Создаём новый расход
    const newExpense = {
      id: (typeof crypto !== "undefined" && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : String(Date.now()) + Math.random().toString(36).substr(2, 9),
      name: creating.name.trim(),
      amount: Number(creating.amount),
      category: finalCategory
    };

    // Обновляем день
    const updatedDay = {
      ...dayData,
      expenses: [...dayData.expenses, newExpense]
    };

    updateDay(updatedDay);

    // Раскрываем категорию и скроллим к ней
    setOpenCats(prev => ({ ...prev, [finalCategory]: true }));
    setCreating(null);

    setTimeout(() => {
      const el = contentRefs.current[finalCategory];
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
  };

  const deleteExpense = (id) => {
    const updatedDay = {
      ...dayData,
      expenses: dayData.expenses.filter(e => e.id !== id)
    };
    updateDay(updatedDay);
  };

  const deleteCategoryFromDay = (category) => {
    if (!window.confirm(`Удалить категорию "${category}" и все её расходы из этого дня?`)) {
      return;
    }
    
    const updatedExpenses = dayData.expenses.filter(exp => exp.category !== category);
    const updatedDay = {
      ...dayData,
      expenses: updatedExpenses
    };
    
    updateDay(updatedDay);
    setOpenCats(prev => ({ ...prev, [category]: false }));
  };

  // Рассчитываем общую сумму за день
  const dayTotal = dayData.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div style={{
      border: "1px solid #2b2b2b",
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
      background: "#121212",
      color: "#e6e6e6",
      boxSizing: "border-box",
      width: "100%",
      minHeight: "200px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span>{dayData.date}</span>
          {dayTotal > 0 && (
            <span style={{
              fontSize: "12px",
              background: "rgba(74, 144, 226, 0.2)",
              color: "#4a90e2",
              padding: "2px 8px",
              borderRadius: "10px",
              fontWeight: "600"
            }}>
              {dayTotal.toLocaleString("ru-RU")} ₽
            </span>
          )}
        </h3>
      </div>

      <div style={{ marginTop: 12 }}>
        {orderedCategories.length === 0 && (
          <div style={{ 
            color: "#aaa", 
            padding: "16px 8px",
            textAlign: "center",
            fontStyle: "italic",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "6px"
          }}>
            Нет расходов за этот день.
            <br/>
            <span style={{ fontSize: "12px" }}>Нажмите «Добавить расход» или + в категории</span>
          </div>
        )}

        {orderedCategories.map(cat => {
          const items = grouped[cat] || [];
          const isOpen = !!openCats[cat];
          const categoryTotal = items.reduce((sum, exp) => sum + exp.amount, 0);

          return (
            <div key={cat} style={{ marginBottom: 10 }}>
              <div
                onClick={() => toggleCategory(cat)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: isOpen ? "#1f1f1f" : "#1b1b1b",
                  border: `1px solid ${isOpen ? "#2f2f2f" : "#252525"}`,
                  position: "relative",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => !isOpen && (e.currentTarget.style.background = "#1d1d1d")}
                onMouseLeave={(e) => !isOpen && (e.currentTarget.style.background = "#1b1b1b")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontWeight: 700 }}>{cat}</div>
                  <div style={{ 
                    fontSize: "12px", 
                    color: "#9aa4b2",
                    background: "rgba(255,255,255,0.05)",
                    padding: "1px 6px",
                    borderRadius: "10px"
                  }}>
                    {categoryTotal.toLocaleString("ru-RU")} ₽
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ color: "#9aa4b2", fontSize: 13 }}>{items.length} шт.</div>
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      startCreateInCategory(cat); 
                    }}
                    style={{
                      background: "#2a2a2a",
                      border: "1px solid #333",
                      color: "#fff",
                      borderRadius: 6,
                      padding: "4px 8px",
                      cursor: "pointer",
                      zIndex: 1,
                      fontSize: "14px",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#333"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#2a2a2a"}
                    title={`Добавить расход в "${cat}"`}
                  >
                    +
                  </button>
                  
                  <div style={{ 
                    fontSize: 14, 
                    color: isOpen ? "#1f6feb" : "#888",
                    transition: "transform 0.2s ease",
                    transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)"
                  }}>
                    ▼
                  </div>
                </div>
              </div>

              <div
                ref={el => (contentRefs.current[cat] = el)}
                style={{
                  overflow: "hidden",
                  transition: "max-height 0.28s ease, opacity 0.28s ease",
                  maxHeight: isOpen ? (items.length * 56 + 120) : 0,
                  opacity: isOpen ? 1 : 0,
                  marginTop: 8
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map(exp => (
                    <ExpenseItem 
                      key={exp.id} 
                      expense={exp} 
                      onDelete={deleteExpense} 
                    />
                  ))}

                  {/* Форма добавления расхода в существующую категорию */}
                  {creating && 
                   creating.stage === "details" && 
                   creating.category && 
                   creating.category !== "new" && 
                   creating.category === cat && (
                    <div style={{
                      marginTop: 6,
                      padding: 8,
                      background: "#111",
                      border: "1px solid #262626",
                      borderRadius: 8,
                      display: "flex",
                      gap: 8,
                      alignItems: "center"
                    }}>
                      <input
                        placeholder="Название"
                        value={creating.name}
                        onChange={e => setCreating({ ...creating, name: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && saveExpense()}
                        style={{ 
                          flex: 1, 
                          padding: 8, 
                          borderRadius: 6, 
                          border: "1px solid #333", 
                          background: "#0f0f0f", 
                          color: "#fff" 
                        }}
                        autoFocus
                      />
                      <input
                        placeholder="Сумма"
                        type="number"
                        value={creating.amount}
                        onChange={e => setCreating({ ...creating, amount: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && saveExpense()}
                        style={{ 
                          width: 100, 
                          padding: 8, 
                          borderRadius: 6, 
                          border: "1px solid #333", 
                          background: "#0f0f0f", 
                          color: "#fff" 
                        }}
                      />
                      <button 
                        onClick={saveExpense}
                        style={{ 
                          padding: "8px 10px", 
                          background: "#1f6feb", 
                          color: "#fff", 
                          border: "none", 
                          borderRadius: 6,
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        ОК
                      </button>
                      <button 
                        onClick={cancelCreating}
                        style={{ 
                          padding: "8px 10px", 
                          background: "#2a2a2a", 
                          color: "#fff", 
                          border: "none", 
                          borderRadius: 6,
                          cursor: "pointer"
                        }}
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Выбор категории для нового расхода */}
      {creating && creating.stage === "choose" && (
        <div style={{ 
          marginTop: 12, 
          padding: 12, 
          background: "#111", 
          border: "1px solid #262626", 
          borderRadius: 8 
        }}>
          <div style={{ marginBottom: 8, color: "#cfd8e3" }}>
            Выберите категорию
            <span style={{ fontSize: "12px", color: "#888", marginLeft: "8px" }}>
              ({localCategories.length} доступно)
            </span>
          </div>

          <select
            value={creating.category}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setCreating({ ...creating, category: "" });
                return;
              }
              if (val === "new") {
                setCreating({ 
                  ...creating, 
                  category: "new", 
                  stage: "details", 
                  newCategoryName: "", 
                  name: "", 
                  amount: "" 
                });
              } else {
                setCreating({ 
                  ...creating, 
                  category: val, 
                  stage: "details", 
                  name: "", 
                  amount: "" 
                });
                setOpenCats(prev => ({ ...prev, [val]: true }));
                const el = contentRefs.current[val];
                if (el && typeof el.scrollIntoView === "function") {
                  setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
                }
              }
            }}
            style={{ 
              width: "100%", 
              padding: 8, 
              borderRadius: 6, 
              border: "1px solid #333", 
              background: "#0f0f0f", 
              color: "#fff",
              fontSize: "14px"
            }}
          >
            <option value="">-- Выберите категорию --</option>
            {localCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="new">+ Создать новую категорию</option>
          </select>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button 
              onClick={cancelCreating} 
              style={{ 
                padding: "8px 12px", 
                background: "#3a3a3a", 
                color: "#fff", 
                border: "none", 
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Форма создания новой категории */}
      {creating && creating.stage === "details" && creating.category === "new" && (
        <div style={{ 
          marginTop: 12, 
          padding: 12, 
          background: "#111", 
          border: "1px solid #262626", 
          borderRadius: 8, 
          display: "flex", 
          flexDirection: "column", 
          gap: 8 
        }}>
          <div style={{ color: "#cfd8e3", marginBottom: 4 }}>
            Создание новой категории
          </div>
          <input 
            placeholder="Название новой категории" 
            value={creating.newCategoryName} 
            onChange={e => setCreating({ ...creating, newCategoryName: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && saveExpense()}
            style={{ 
              padding: 8, 
              borderRadius: 6, 
              border: "1px solid #333", 
              background: "#0f0f0f", 
              color: "#fff" 
            }}
            autoFocus
          />
          <input 
            placeholder="Название расхода" 
            value={creating.name} 
            onChange={e => setCreating({ ...creating, name: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && saveExpense()}
            style={{ 
              padding: 8, 
              borderRadius: 6, 
              border: "1px solid #333", 
              background: "#0f0f0f", 
              color: "#fff" 
            }}
          />
          <input 
            placeholder="Сумма" 
            type="number" 
            value={creating.amount} 
            onChange={e => setCreating({ ...creating, amount: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && saveExpense()}
            style={{ 
              padding: 8, 
              borderRadius: 6, 
              border: "1px solid #333", 
              background: "#0f0f0f", 
              color: "#fff" 
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button 
              onClick={saveExpense} 
              style={{ 
                padding: "8px 12px", 
                background: "#1f6feb", 
                color: "#fff", 
                border: "none", 
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "600",
                flex: 1
              }}
            >
              Создать категорию и добавить расход
            </button>
            <button 
              onClick={cancelCreating} 
              style={{ 
                padding: "8px 12px", 
                background: "#2a2a2a", 
                color: "#fff", 
                border: "none", 
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Кнопка добавления расхода */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginTop: "16px",
        paddingTop: "12px",
        borderTop: "1px solid #2a2a2a"
      }}>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {dayData.expenses.length > 0 ? (
            <>
              Всего: {dayData.expenses.length} расходов на {dayTotal.toLocaleString("ru-RU")} ₽
              {localCategories.length > 0 && ` • ${localCategories.length} категорий`}
            </>
          ) : (
            "Нет расходов"
          )}
        </div>
        <button
          onClick={startCreateNew}
          style={{
            background: "#1f6feb",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px",
            transition: "background 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#1060d0"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#1f6feb"}
        >
          + Добавить расход
        </button>
      </div>
    </div>
  );
}