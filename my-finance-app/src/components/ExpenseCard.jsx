import React, { useState } from "react";
import ExpenseItem from "./ExpenseItem";

export default function ExpenseCard({ dayData, updateDay, categories, setCategories }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // какие категории раскрыты
  const [openCats, setOpenCats] = useState({});

  const toggleCategory = (cat) => {
    setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const addExpense = () => {
    let chosenCategory = category;

    if (category === "new" && newCategory.trim()) {
      chosenCategory = newCategory.trim();
      if (!categories.includes(chosenCategory)) {
        setCategories([...categories, chosenCategory]);
      }
    }

    if (!name || !chosenCategory || !amount) return;

    const newExpense = {
      id: Date.now(),
      name,
      category: chosenCategory,
      amount: parseFloat(amount)
    };

    const updatedDay = {
      ...dayData,
      expenses: [...dayData.expenses, newExpense]
    };

    updateDay(updatedDay);

    setName("");
    setCategory("");
    setAmount("");
    setNewCategory("");
  };

  const deleteExpense = (id) => {
    const updatedDay = {
      ...dayData,
      expenses: dayData.expenses.filter(e => e.id !== id)
    };
    updateDay(updatedDay);
  };

  // группировка расходов по категориям
  const grouped = dayData.expenses.reduce((acc, exp) => {
    if (!acc[exp.category]) acc[exp.category] = [];
    acc[exp.category].push(exp);
    return acc;
  }, {});

  return (
    <div style={{ border: "1px solid #ccc", height: "min-content", padding: "10px", marginBottom: "10px" }}>
      <h3>{dayData.date}</h3>

      {/* КАТЕГОРИИ */}
      {Object.keys(grouped).map(cat => (
        <div key={cat} style={{ marginBottom: "8px" }}>
          <div
            onClick={() => toggleCategory(cat)}
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              background: "#f2f2f2",
              padding: "6px",
              borderRadius: "5px"
            }}
          >
            {cat} {openCats[cat] ? "▾" : "▸"}
          </div>

          {/* раскрытые расходы */}
          {openCats[cat] && (
            <div style={{ marginLeft: "10px", marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
              {grouped[cat].map(exp => (
                <ExpenseItem key={exp.id} expense={exp} onDelete={deleteExpense} />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* ДОБАВЛЕНИЕ */}
      <div style={{ marginTop: "10px" }}>
        <input
          placeholder="Название"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">--Выберите категорию--</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
          <option value="new">+ Новая категория</option>
        </select>

        {category === "new" && (
          <input
            type="text"
            placeholder="Название новой категории"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
          />
        )}

        <input
          placeholder="Сумма"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />

        <button onClick={addExpense}>Добавить</button>
      </div>
    </div>
  );
}