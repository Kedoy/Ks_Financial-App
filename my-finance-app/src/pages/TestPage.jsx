import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MultiSelect from "../components/MultiSelect";
import NumberInput from "../components/NumberInput";
import Result from "../components/Result";

/**
 * TestPage
 * props:
 *   - days: массив дней в формате { date: "YYYY-MM-DD", expenses: [{ id, name, category, amount }, ...] }
 */
export default function TestPage({ days }) {
  const [stage, setStage] = useState("intro"); // "intro" | "test" | "result"
  const [step, setStep] = useState(0); // индекс текущего вопроса
  const [answers, setAnswers] = useState([]); // answers[step] = ответ

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
  const progressPercent = Math.round(((step + 1) / totalSteps) * 100);

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
    });
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
    });
  };

  const handleNumberSubmit = (num) => {
    setAnswers(prev => {
      const copy = [...prev];
      copy[step] = num;
      return copy;
    });
    // перейти к подсчёту
    setTimeout(() => calcScoreAndFinish());
  };

  const calcScoreAndFinish = () => {
    // считаем score по правилам (точное совпадение для числа)
    // let s = 0;
    // questions.forEach((q, idx) => {
    //   const a = answers[idx];
    //   if (q.type === "single") {
    //     if (a === q.correct) s++;
    //   } else if (q.type === "multiple") {
    //     if (Array.isArray(a) && a.length === q.correct.length) {
    //       // проверка: оба совпадают (порядок не важен)
    //       const sortedA = [...a].slice(0).sort();
    //       const sortedC = [...q.correct].slice(0).sort();
    //       if (JSON.stringify(sortedA) === JSON.stringify(sortedC)) s++;
    //     }
    //   } else if (q.type === "number") {
    //     if (Number(a) === Number(q.correct)) s++;
    //   }
    // });
    // setScore(s);
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
        style={{
          maxWidth: "500px",
          width: "100%",
          margin: "0 auto",
          padding: "24px",
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );

  // ----- Рендер -----
  return (
    <div style={{ 
      padding: "24px", 
      maxWidth: "800px", 
      margin: "100px 100px",
      width: "100%" 
    }}>
      {/* ПРОГРЕСС БАР */}
      {stage !== "intro" && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ 
            width: "100%", 
            height: "8px", 
            backgroundColor: "#e5e7eb",
            borderRadius: "12px",
            overflow: "hidden"
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
              style={{
                height: "100%",
                background: "linear-gradient(to right, #3b82f6, #6366f1)"
              }}
            />
          </div>
          <div style={{ 
            fontSize: "14px", 
            color: "#6b7280", 
            marginTop: "8px" 
          }}>
            Вопрос {Math.min(step + 1, totalSteps)} из {totalSteps}
          </div>
        </div>
      )}

      {/* INTRO */}
      {stage === "intro" && (
        <Card>
          <h1 style={{ 
            fontSize: "24px", 
            fontWeight: "bold", 
            marginBottom: "12px",
            color: "#1f2937"
          }}>
            Тест финансовой грамотности
          </h1>
          <p style={{ 
            fontSize: "16px", 
            color: "#6b7280", 
            marginBottom: "24px",
            lineHeight: "1.5"
          }}>
            Тест из 4 вопросов, построенный на твоих реальных расходах.
          </p>
          <button
            onClick={() => { setStage("test"); setStep(0); }}
            style={{
              display: "block",
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "12px",
              border: "none",
              fontWeight: "600",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background-color 0.2s",
              textAlign: "center"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
          >
            Начать тест
          </button>
        </Card>
      )}

      {/* TEST STEPS */}
      {stage === "test" && (
        <Card>
          <h2 style={{ 
            fontSize: "20px", 
            fontWeight: "600", 
            marginBottom: "32px",
            color: "#1f2937",
            textAlign: "center",
            lineHeight: "1.4"
          }}>
            {questions[step].text}
          </h2>

          {/* single - всегда по центру независимо от длины вопроса */}
          {questions[step].type === "single" && (
            <div style={{ 
              width: "100%",
              maxWidth: "400px",
              margin: "0 auto"
            }}>
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "12px", 
                marginBottom: "24px"
              }}>
                {questions[step].options.map(opt => {
                  const isSelected = answers[step] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleAnswerImmediate(opt)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: isSelected ? "2px solid #3b82f6" : "1px solid #d1d5db",
                        backgroundColor: isSelected ? "#3b82f6" : "white",
                        color: isSelected ? "white" : "#374151",
                        fontWeight: "500",
                        fontSize: "16px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        outline: "none",
                        textAlign: "left",
                        width: "100%",
                        boxSizing: "border-box"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "white";
                        }
                      }}
                    >
                      {opt}
                      {isSelected && (
                        <span style={{ float: "right", fontWeight: "bold" }}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* multiple */}
          {questions[step].type === "multiple" && (
            <div style={{ 
              width: "100%",
              maxWidth: "400px",
              margin: "0 auto"
            }}>
              <MultiSelect
                options={questions[step].options}
                onConfirm={handleMultiConfirm}
                maxSelect={2}
              />
            </div>
          )}

          {/* number */}
          {questions[step].type === "number" && (
            <div style={{ 
              width: "100%",
              maxWidth: "400px",
              margin: "0 auto"
            }}>
              <NumberInput onSubmit={handleNumberSubmit} />
            </div>
          )}
        </Card>
      )}

      {/* RESULT */}
      {stage === "result" && (
        <div style={{ 
          maxWidth: "500px",
          margin: "0 auto"
        }}>
          <Result questions={questions} answers={answers} />
        </div>
      )}
    </div>
  );
}