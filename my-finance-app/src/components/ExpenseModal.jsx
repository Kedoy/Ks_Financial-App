// ExpenseModal.jsx
import React, { useState } from "react";

export default function ExpenseModal({ onClose, onAdd, categories, defaultCategory }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(defaultCategory || "");
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    if (!name || !category || !amount) return;
    onAdd({ name, category, amount: parseFloat(amount) });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
      }}
      onClick={onClose} // клик вне окна закрывает
    >
      <div
        style={{
          background: "#181515ff",
          padding: "20px",
          borderRadius: "10px",
          minWidth: "300px"
        }}
        onClick={e => e.stopPropagation()} // клики внутри окна не закрывают
      >
        <h3>Добавить расход</h3>
        <input placeholder="Название" value={name} onChange={e => setName(e.target.value)} />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" placeholder="Сумма" value={amount} onChange={e => setAmount(e.target.value)} />
        <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
          <button onClick={onClose}>Отмена</button>
          <button onClick={handleSubmit}>Добавить</button>
        </div>
      </div>
    </div>
  );
}
