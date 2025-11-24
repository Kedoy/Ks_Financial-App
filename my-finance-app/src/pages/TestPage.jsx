import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MultiSelect from "../components/MultiSelect";
import NumberInput from "../components/NumberInput";

/**
 * TestPage
 * props:
 *   - days: массив дней в формате { date: "YYYY-MM-DD", expenses: [{ id, name, category, amount }, ...] }
 */
export default function TestPage({ days }) {
  const [stage, setStage] = useState("intro"); // "intro" | "test" | "result"
  const [step, setStep] = useState(0); // индекс текущего вопроса
  const [answers, setAnswers] = useState([]); // answers[step] = ответ
  const [score, setScore] = useState(0);
  const [showCorrect, setShowCorrect] = useState(false);

  // ----- Подготовка данных -----
  const allExpenses = useMemo(() => {
    if (!days) return [];
    return days.flatMap(d => (d.expenses || []).map(e => ({ ...e, date: d.date })));
  }, [days]);

  // Проверка достаточности данных
  if (!days || !Array.isArray(days) || allExpenses.length < 5) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Тест недоступен</h2>
          <p>Недостаточно данных для теста. Нужно минимум 5 расходов.</p>
        </div>
      </div>
    );
  }

  // 1) сумма по категориям (для самой дорогой категории)
  const categoryTotals = useMemo(() => {
    const map = {};
    allExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
    });
    return map;
  }, [allExpenses]);

  const mostExpensiveCategory = useMemo(() => {
    const entries = Object.entries(categoryTotals);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }, [categoryTotals]);

  // 2) самая дорогая покупка (единственная)
  const mostExpensivePurchase = useMemo(() => {
    if (allExpenses.length === 0) return null;
    return [...allExpenses].sort((a, b) => b.amount - a.amount)[0];
  }, [allExpenses]);

  // 3) две самые частые категории (по количеству покупок)
  const categoryCount = useMemo(() => {
    const c = {};
    allExpenses.forEach(e => (c[e.category] = (c[e.category] || 0) + 1));
    return c;
  }, [allExpenses]);

  const topTwoCategories = useMemo(() => {
    return Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(x => x[0]);
  }, [categoryCount]);

  // 4) сумма за последнюю неделю (последние 7 дней, включительно)
  const weekSum = useMemo(() => {
    // определим "сегодня" как последнюю дату из days (чтобы не зависеть от локального времени)
    const sortedDays = [...days].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date(sortedDays[0].date);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6); // последние 7 дней включительно

    return allExpenses
      .filter(e => {
        const d = new Date(e.date);
        return d >= weekAgo && d <= today;
      })
      .reduce((s, e) => s + Number(e.amount || 0), 0);
  }, [days, allExpenses]);

  // ----- Вопросы (готовые структуры) -----
  const questions = useMemo(() => {
    const q1Options = Object.keys(categoryTotals);
    const q2Options = allExpenses.map(e => `${e.name} (${e.category})`);
    const q3Options = Object.keys(categoryTotals);
    return [
      {
        id: 1,
        type: "single",
        text: "Какая ваша самая дорогая категория расходов (по сумме всех покупок)?",
        options: q1Options,
        correct: mostExpensiveCategory
      },
      {
        id: 2,
        type: "single",
        text: "Какая была самая дорогая покупка за месяц?",
        options: q2Options,
        correct: mostExpensivePurchase ? `${mostExpensivePurchase.name} (${mostExpensivePurchase.category})` : null
      },
      {
        id: 3,
        type: "multiple",
        text: "Выберите две самые частые категории расходов (по количеству покупок).",
        options: q3Options,
        correct: topTwoCategories
      },
      {
        id: 4,
        type: "number",
        text: "Сколько вы потратили за последнюю неделю?",
        options: [],
        correct: weekSum
      }
    ];
  }, [categoryTotals, allExpenses, mostExpensiveCategory, mostExpensivePurchase, topTwoCategories, weekSum]);

  const totalSteps = questions.length;

  // ----- UI helpers -----
  const progressPercent = Math.round((step / totalSteps) * 100);

  const moveNext = () => {
    setStep(prev => {
      const next = prev + 1;
      if (next >= totalSteps) {
        // подсчитать результат и перейти на экран результата
        calcScoreAndFinish();
      }
      return next;
    });
  };

  const handleAnswerImmediate = (value) => {
    // сохраняем ответ для текущего шага (overwrite)
    setAnswers(prev => {
      const copy = [...prev];
      copy[step] = value;
      return copy;
    });
    // Переход к следующему вопросу с небольшой задержкой (чтобы пользователь увидел нажатие)
    // но не запускаем анимацию выбора (анимация карточки — только на смену шага, а не при клике)
    setTimeout(() => {
      if (step + 1 < totalSteps) {
        setStep(step + 1);
      } else {
        calcScoreAndFinish();
      }
    }, 180);
  };

  const handleMultiConfirm = (arr) => {
    setAnswers(prev => {
      const copy = [...prev];
      copy[step] = arr;
      return copy;
    });
    // сразу переход
    setTimeout(() => {
      if (step + 1 < totalSteps) setStep(step + 1);
      else calcScoreAndFinish();
    }, 120);
  };

  const handleNumberSubmit = (num) => {
    setAnswers(prev => {
      const copy = [...prev];
      copy[step] = num;
      return copy;
    });
    // перейти к подсчёту
    setTimeout(() => calcScoreAndFinish(), 120);
  };

  const calcScoreAndFinish = () => {
    // считаем score по правилам (точное совпадение для числа)
    let s = 0;
    questions.forEach((q, idx) => {
      const a = answers[idx];
      if (q.type === "single") {
        if (a === q.correct) s++;
      } else if (q.type === "multiple") {
        if (Array.isArray(a) && a.length === q.correct.length) {
          // проверка: оба совпадают (порядок не важен)
          const sortedA = [...a].slice(0).sort();
          const sortedC = [...q.correct].slice(0).sort();
          if (JSON.stringify(sortedA) === JSON.stringify(sortedC)) s++;
        }
      } else if (q.type === "number") {
        if (Number(a) === Number(q.correct)) s++;
      }
    });
    setScore(s);
    setStage("result");
  };

  // ----- Компоненты отображения карточек (анимация только на смену шага) -----
  const Card = ({ children }) => (
    <AnimatePresence mode="wait">
      <motion.div
        key={stage + "-" + step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.28 }}
        className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );

  // ----- Рендер -----
  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* ПРОГРЕСС БАР */}
      {stage !== "intro" && (
        <div className="mb-4">
          <div className="w-full h-3 bg-gray-200 rounded-xl overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(4, progressPercent)}%` }}
              transition={{ duration: 0.4 }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
            />
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Вопрос {Math.min(step + 1, totalSteps)} из {totalSteps}
          </div>
        </div>
      )}

      {/* INTRO */}
      {stage === "intro" && (
        <Card>
          <h1 className="text-2xl font-bold mb-3">Тест финансовой грамотности</h1>
          <p className="text-gray-600 mb-4">
            Тест из 4 вопросов, построенный на твоих реальных расходах.
          </p>
          <button
            onClick={() => { setStage("test"); setStep(0); }}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Начать тест
          </button>
        </Card>
      )}

      {/* TEST STEPS */}
      {stage === "test" && (
        <Card>
          <h2 className="text-lg font-semibold mb-3">
            {questions[step].text}
          </h2>

          {/* single */}
          {questions[step].type === "single" && (
            <div>
              {questions[step].options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswerImmediate(opt)}
                  className="w-full text-left p-3 mb-3 border rounded-xl hover:bg-gray-50"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* multiple */}
          {questions[step].type === "multiple" && (
            <MultiSelect
              options={questions[step].options}
              onConfirm={handleMultiConfirm}
              maxSelect={2}
            />
          )}

          {/* number */}
          {questions[step].type === "number" && (
            <NumberInput onSubmit={handleNumberSubmit} />
          )}
        </Card>
      )}

      {/* RESULT */}
      {stage === "result" && (
        <Card>
          <h1 className="text-2xl font-bold mb-2">Результат</h1>
          <p className="mb-4">Вы набрали <b>{score}</b> из <b>{totalSteps}</b> ({Math.round((score / totalSteps) * 100)}%).</p>

          <button
            onClick={() => setShowCorrect(prev => !prev)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl mb-3"
          >
            {showCorrect ? "Скрыть правильные ответы" : "Показать правильные ответы"}
          </button>

          {showCorrect && (
            <div className="mt-3 space-y-3">
              {questions.map((q, i) => (
                <div key={q.id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="font-medium">{i + 1}. {q.text}</div>
                  <div className="mt-1 text-sm text-gray-700">
                    Твой ответ: <span className="font-semibold">{Array.isArray(answers[i]) ? (answers[i].join(", ") || "—") : (answers[i] ?? "—")}</span>
                  </div>
                  <div className="text-sm mt-1">
                    Правильный ответ: <span className="font-semibold">{Array.isArray(q.correct) ? q.correct.join(", ") : (q.correct ?? "—")}</span>
                  </div>
                  <div className={`mt-2 font-bold ${(() => {
                    // определим правильность
                    if (q.type === "single") return (answers[i] === q.correct) ? "text-green-600" : "text-red-600";
                    if (q.type === "multiple") {
                      const a = answers[i] || [];
                      const ok = Array.isArray(a) && a.length === q.correct.length &&
                        JSON.stringify([...a].sort()) === JSON.stringify([...q.correct].sort());
                      return ok ? "text-green-600" : "text-red-600";
                    }
                    if (q.type === "number") return (Number(answers[i]) === Number(q.correct)) ? "text-green-600" : "text-red-600";
                    return "";
                  })()}`}>
                    {(() => {
                      if (q.type === "single") return (answers[i] === q.correct) ? "✓ Верно" : "✗ Неверно";
                      if (q.type === "multiple") {
                        const a = answers[i] || [];
                        const ok = Array.isArray(a) && a.length === q.correct.length &&
                          JSON.stringify([...a].sort()) === JSON.stringify([...q.correct].sort());
                        return ok ? "✓ Верно" : "✗ Неверно";
                      }
                      if (q.type === "number") return (Number(answers[i]) === Number(q.correct)) ? "✓ Верно" : "✗ Неверно";
                      return "";
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => {
                // сброс
                setStage("intro");
                setStep(0);
                setAnswers([]);
                setScore(0);
                setShowCorrect(false);
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-xl"
            >
              Пройти снова
            </button>

            <button
              onClick={() => {
                // вернуться на страницу расходов — просто навигация зависит от твоего App.jsx
                // здесь использую history.back как безопасный вариант (можешь заменить)
                window.history.back();
              }}
              className="px-4 py-2 bg-white border rounded-xl"
            >
              Вернуться
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
