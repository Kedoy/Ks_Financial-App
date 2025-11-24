import React, { useState, useRef } from "react";
import ExpenseCard from "../components/ExpenseCard";
import MiniSummary from "../components/MiniSummary";

export default function ExpensesPage({ days, setDays }) {
  const [categories, setCategories] = useState(["Еда", "Дом"]);
  const dateInputRef = useRef(null);

  const sortedDays = [...days].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latestIndex = sortedDays.length
    ? sortedDays.findIndex(day => day.date === sortedDays[sortedDays.length - 1].date)
    : 0;

  const [currentIndex, setCurrentIndex] = useState(latestIndex);

  const addDay = (date) => {
    if (!date) return;
    if (days.some(d => d.date === date)) {
      alert("День с этой датой уже существует!");
      return;
    }
    const newDays = [...days, { date, expenses: [] }];
    setDays(newDays);
    setCurrentIndex(newDays.length - 1);
  };

  const prevCard = () => setCurrentIndex(idx => Math.max(0, idx - 1));
  const nextCard = () => setCurrentIndex(idx => Math.min(days.length - 1, idx + 1));

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      boxSizing: "border-box",
      width: "100%"
    }}>
      <h1 style={{ color: "#fff" }}>Мои расходы</h1>

      {/* Добавить день */}
      <div style={{ marginBottom: "20px", position: "relative" }}>
        <button onClick={() => dateInputRef.current.showPicker()}>Добавить день</button>
        <input
          type="date"
          ref={dateInputRef}
          style={{ position: "absolute", left: 0, top: 0, opacity: 0, width: "1px", height: "1px", pointerEvents: "none" }}
          onChange={e => addDay(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "center" }}>
        <button onClick={prevCard} disabled={currentIndex === 0} style={{ marginRight: "10px" }}>←</button>

        <div style={{ overflow: "hidden", width: "520px" /* ширина видимой области */ }}>
          <div
            style={{
              display: "flex",
              transition: "transform 0.5s ease",
              transform: `translateX(-${currentIndex * 520}px)` // карточка 500 + 20px padding
            }}
          >
            {sortedDays.map(day => (
              <div key={day.date} style={{ width: "500px", flexShrink: 0, marginRight: "20px" }}>
                <ExpenseCard
                  dayData={day}
                  updateDay={(updatedDay) => {
                    const newDays = days.map(d => d.date === updatedDay.date ? updatedDay : d);
                    setDays(newDays);
                  }}
                  categories={categories}
                  setCategories={setCategories}
                />
              </div>
            ))}
          </div>
        </div>

        <button onClick={nextCard} disabled={currentIndex === sortedDays.length - 1} style={{ marginLeft: "10px" }}>→</button>
      </div>

      {/* Сводка */}
      {sortedDays[currentIndex] && (
        <div style={{ width: "500px", marginTop: "20px" }}>
          <MiniSummary days={days} />
        </div>
      )}
    </div>
  );
}
