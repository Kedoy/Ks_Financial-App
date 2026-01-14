import React, { useState } from "react";

export default function NumberInput({ onSubmit }) {
  const [val, setVal] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const canSubmit = val !== "" && !isNaN(Number(val)) && Number(val) >= 0;

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(Number(val));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && canSubmit) {
      handleSubmit();
    }
  };

  return (
    <div style={{ 
      width: "100%",
      maxWidth: "400px",
      margin: "0 auto",
      padding: "20px"
    }}>
      <div style={{
        marginBottom: "24px"
      }}>
        <input
          type="text" // Изменено с "number" на "text"
          inputMode="numeric" // Сохраняем цифровую клавиатуру на мобильных устройствах
          pattern="[0-9]*" // Разрешаем только цифры
          value={val}
          onChange={e => {
            // Разрешаем только цифры
            const newValue = e.target.value.replace(/\D/g, '');
            setVal(newValue);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyPress={handleKeyPress}
          placeholder="Введите сумму"
          style={{
            width: "100%",
            padding: "14px 16px",
            fontSize: "16px",
            borderRadius: "12px",
            border: isFocused ? "2px solid #3b82f6" : "1px solid #d1d5db",
            backgroundColor: "white",
            color: "#1f2937",
            outline: "none",
            transition: "all 0.2s ease",
            boxSizing: "border-box",
            fontFamily: "inherit",
            // Убираем стрелки
            appearance: "textfield",
            MozAppearance: "textfield",
            WebkitAppearance: "none"
          }}
        />
        <div style={{
          fontSize: "14px",
          color: "#6b7280",
          marginTop: "8px",
          textAlign: "center"
        }}>
          Введите целое число (например: 1500)
        </div>
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: "14px 16px",
          borderRadius: "12px",
          backgroundColor: canSubmit ? "#2563eb" : "#d1d5db",
          color: "white",
          fontWeight: "600",
          fontSize: "16px",
          border: "none",
          cursor: canSubmit ? "pointer" : "not-allowed",
          transition: "all 0.2s ease",
          marginBottom: "12px",
          boxSizing: "border-box"
        }}
        onMouseEnter={(e) => {
          if (canSubmit) {
            e.currentTarget.style.backgroundColor = "#1d4ed8";
          }
        }}
        onMouseLeave={(e) => {
          if (canSubmit) {
            e.currentTarget.style.backgroundColor = "#2563eb";
          }
        }}
      >
        {canSubmit ? `Продолжить (${val}₽)` : "Введите сумму"}
      </button>

      <div style={{
        fontSize: "14px",
        color: "#6b7280",
        textAlign: "center",
        marginTop: "8px"
      }}>
        Нажмите Enter для быстрого подтверждения
      </div>
    </div>
  );
}