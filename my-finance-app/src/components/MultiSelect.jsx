import React, { useState } from "react";

export default function MultiSelect({ options = [], onConfirm, maxSelect = 2 }) {
  const [selected, setSelected] = useState([]);

  const toggleOption = (option) => {
    setSelected(prev => {
      // Если уже выбрана - убираем
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      }
      // Если достигнут лимит - не добавляем
      if (prev.length >= maxSelect) {
        return prev;
      }
      // Добавляем
      return [...prev, option];
    });
  };

  const handleConfirm = () => {
    // Проверяем, что выбрано нужное количество
    if (selected.length === maxSelect) {
      onConfirm(selected);
    }
  };

  // Проверяем, можно ли подтвердить
  const canConfirm = selected.length === maxSelect;

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        {options.map(option => {
          const isSelected = selected.includes(option);
          const isDisabled = !isSelected && selected.length >= maxSelect;
          
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              disabled={isDisabled}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: isSelected ? "2px solid #3b82f6" : "1px solid #d1d5db",
                backgroundColor: isSelected ? "#3b82f6" : "white",
                color: isSelected ? "white" : "#374151",
                fontWeight: "500",
                fontSize: "16px",
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.5 : 1,
                transition: "all 0.2s ease",
                outline: "none",
                textAlign: "left"
              }}
            >
              {option}
              {isSelected && (
                <span style={{ float: "right", fontWeight: "bold" }}>✓</span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!canConfirm}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "8px",
          backgroundColor: canConfirm ? "#2563eb" : "#d1d5db",
          color: "white",
          fontWeight: "600",
          fontSize: "16px",
          border: "none",
          cursor: canConfirm ? "pointer" : "not-allowed",
          transition: "all 0.2s ease",
          marginBottom: "10px"
        }}
      >
        {canConfirm ? `Продолжить` : `Выберите 2 варианта`}
      </button>

      <div style={{
        fontSize: "14px",
        color: selected.length >= maxSelect ? "#2563eb" : "#6b7280",
        textAlign: "center"
      }}>
        {selected.length >= maxSelect 
          ? ``
          : `Выбрано: ${selected.length} из ${maxSelect}`
        }
      </div>
      
      {/* Отображение выбранных вариантов */}
      {selected.length > 0 && (
        <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f3f4f6", borderRadius: "8px" }}>
          <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
            Выбранные варианты:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {selected.map(item => (
              <span
                key={item}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#dbeafe",
                  color: "#1e40af",
                  borderRadius: "16px",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}