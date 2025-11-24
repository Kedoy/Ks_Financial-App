import React, { useState } from "react";

export default function NumberInput({ onSubmit }) {
  const [val, setVal] = useState("");

  return (
    <div>
      <input
        type="number"
        value={val}
        onChange={e => setVal(e.target.value)}
        className="w-full p-3 border rounded-xl mb-3"
        placeholder="Введите число (целая сумма)"
      />
      <button
        disabled={val === ""}
        onClick={() => onSubmit(Number(val))}
        className={`w-full p-3 rounded-xl text-white ${val !== "" ? "bg-blue-600" : "bg-gray-300"}`}
      >
        Ответить
      </button>
    </div>
  );
}
