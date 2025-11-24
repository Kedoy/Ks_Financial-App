import React from "react";

export default function MiniSummary({ days }) {
  if (!days || days.length === 0) return null;

  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  // фильтруем дни за последние 7 дней
  const lastWeekDays = days.filter(d => {
    const dayDate = new Date(d.date);
    return dayDate >= weekAgo && dayDate <= today;
  });

  // суммируем расходы по категориям
  const categoryTotals = {};
  lastWeekDays.forEach(day => {
    day.expenses.forEach(exp => {
      if (!categoryTotals[exp.category]) categoryTotals[exp.category] = 0;
      categoryTotals[exp.category] += exp.amount;
    });
  });

  const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  return (
    <div style={{
      width: "100%",
      border: "1px solid #444",
      padding: "20px",
      borderRadius: "8px",
      background: "#1a1a1a",
      color: "#ffffff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
    }}>
      <h3 style={{ color: "#ffffff", marginBottom: "15px" }}>Сводка за последнюю неделю</h3>
      <p style={{ margin: "8px 0", color: "#cccccc" }}>
        Всего расходов: <strong style={{ color: "#ffffff" }}>{total} ₽</strong>
      </p>
      <div style={{ 
        marginTop: "15px", 
        padding: "10px", 
        background: "#2a2a2a", 
        borderRadius: "6px",
        border: "1px solid #333"
      }}>
        <p style={{ margin: 0, color: "#999", fontStyle: "italic" }}>Тут будет совет от ИИ</p>
      </div>
    </div>
  );
}
