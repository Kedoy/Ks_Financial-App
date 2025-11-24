import React from "react";

export default function ExpenseItem({ expense, onDelete }) {
  return (
    <div style={{ display: "flex", height: "min-content", justifyContent: "space-between", margin: "5px 0" }}>
      <span>{expense.name} ({expense.category})</span>
      <div>
        <span>{expense.amount} ₽</span>
        <button onClick={() => onDelete(expense.id)} style={{ marginLeft: "10px" }}>Удалить</button>
      </div>
    </div>
  );
}
