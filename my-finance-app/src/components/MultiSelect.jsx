import React, { useState } from "react";

/**
 * MultiSelect
 * props:
 *  - options: array of option strings
 *  - onConfirm: function(selectedArray)
 *  - maxSelect: optional number (default Infinity)
 */
export default function MultiSelect({ options = [], onConfirm, maxSelect = Infinity }) {
  const [selected, setSelected] = useState([]);

  const toggle = (o) => {
    setSelected(prev => {
      if (prev.includes(o)) return prev.filter(x => x !== o);
      if (prev.length >= maxSelect) return prev; // не добавляем больше max
      return [...prev, o];
    });
  };

  return (
    <div>
      <div className="space-y-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`w-full text-left p-3 rounded-xl border ${
              selected.includes(opt) ? "bg-blue-100 border-blue-300" : "hover:bg-gray-50"
            }`}
          >
            <input
              readOnly
              type="checkbox"
              checked={selected.includes(opt)}
              className="mr-3"
            />
            {opt}
          </button>
        ))}
      </div>

      <button
        disabled={selected.length === 0}
        onClick={() => onConfirm(selected)}
        className={`mt-4 w-full p-3 rounded-xl text-white ${selected.length > 0 ? "bg-blue-600" : "bg-gray-300"}`}
      >
        Подтвердить ({selected.length})
      </button>
    </div>
  );
}
