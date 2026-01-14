import React from "react";

export default function Result({ questions, answers }) {
  // Подсчет результатов
  const calculateResults = () => {
    let correctCount = 0;
    const results = questions.map((question, idx) => {
      const userAnswer = answers[idx];
      let isCorrect = false;

      if (question.type === "single") {
        isCorrect = userAnswer === question.correct;
      } else if (question.type === "multiple") {
        if (Array.isArray(userAnswer) && Array.isArray(question.correct)) {
          const sortedUser = [...userAnswer].sort();
          const sortedCorrect = [...question.correct].sort();
          isCorrect = JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
        }
      } else if (question.type === "number") {
        isCorrect = Number(userAnswer) === Number(question.correct);
      }

      if (isCorrect) correctCount++;

      return {
        question: question.text,
        userAnswer: Array.isArray(userAnswer) ? userAnswer.join(", ") : userAnswer,
        correctAnswer: Array.isArray(question.correct) ? question.correct.join(", ") : question.correct,
        isCorrect
      };
    });

    return {
      results,
      score: correctCount,
      total: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100)
    };
  };

  const { results, score, total, percentage } = calculateResults();

  return (
    <div style={{ 
      width: "100%",
      maxWidth: "500px",
      margin: "0 auto",
      padding: "24px"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        padding: "32px"
      }}>
        {/* Заголовок */}
        <h2 style={{ 
          fontSize: "24px", 
          fontWeight: "bold", 
          textAlign: "center",
          marginBottom: "32px",
          color: "#1f2937"
        }}>
          Результаты теста
        </h2>

        {/* Статистика */}
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          marginBottom: "40px",
          padding: "24px",
          backgroundColor: "#f3f4f6",
          borderRadius: "12px"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#2563eb",
              marginBottom: "4px"
            }}>
              {percentage}%
            </div>
            <div style={{
              fontSize: "14px",
              color: "#6b7280"
            }}>
              Процент успеха
            </div>
          </div>

          <div style={{ 
            width: "1px", 
            height: "40px", 
            backgroundColor: "#d1d5db" 
          }}></div>

          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#10b981",
              marginBottom: "4px"
            }}>
              {score}
            </div>
            <div style={{
              fontSize: "14px",
              color: "#6b7280"
            }}>
              Правильных ответов
            </div>
          </div>

          <div style={{ 
            width: "1px", 
            height: "40px", 
            backgroundColor: "#d1d5db" 
          }}></div>

          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#ef4444",
              marginBottom: "4px"
            }}>
              {total - score}
            </div>
            <div style={{
              fontSize: "14px",
              color: "#6b7280"
            }}>
              Ошибок
            </div>
          </div>
        </div>

        {/* Визуальное сравнение */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "20px",
              fontWeight: "bold",
              marginRight: "20px"
            }}>
              {score}
            </div>
            <div style={{ 
              width: "120px", 
              height: "8px", 
              backgroundColor: "#e5e7eb",
              borderRadius: "4px",
              overflow: "hidden",
              display: "flex"
            }}>
              <div style={{
                width: `${percentage}%`,
                height: "100%",
                backgroundColor: "#10b981"
              }}></div>
              <div style={{
                width: `${100 - percentage}%`,
                height: "100%",
                backgroundColor: "#ef4444"
              }}></div>
            </div>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "20px",
              fontWeight: "bold",
              marginLeft: "20px"
            }}>
              {total - score}
            </div>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "14px",
            color: "#6b7280"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                width: "12px", 
                height: "12px", 
                backgroundColor: "#10b981",
                borderRadius: "50%",
                margin: "0 auto 4px"
              }}></div>
              <span>Правильные</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <span>{score}/{total}</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                width: "12px", 
                height: "12px", 
                backgroundColor: "#ef4444",
                borderRadius: "50%",
                margin: "0 auto 4px"
              }}></div>
              <span>Ошибки</span>
            </div>
          </div>
        </div>

        {/* Детали по вопросам */}
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "600",
          marginBottom: "20px",
          color: "#1f2937"
        }}>
          Подробные ответы:
        </h3>

        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "16px",
          marginBottom: "32px"
        }}>
          {results.map((result, idx) => (
            <div
              key={idx}
              style={{
                padding: "16px",
                borderRadius: "12px",
                border: `1px solid ${result.isCorrect ? "#10b981" : "#ef4444"}`,
                backgroundColor: result.isCorrect ? "#f0fdf4" : "#fef2f2"
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px"
              }}>
                <div style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1f2937"
                }}>
                  Вопрос {idx + 1}
                </div>
                <div style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: result.isCorrect ? "#10b981" : "#ef4444",
                  backgroundColor: result.isCorrect ? "#dcfce7" : "#fee2e2",
                  padding: "4px 12px",
                  borderRadius: "20px"
                }}>
                  {result.isCorrect ? "✓ Верно" : "✗ Ошибка"}
                </div>
              </div>
              
              <div style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "8px",
                lineHeight: "1.5"
              }}>
                {result.question}
              </div>
              
              <div style={{
                fontSize: "14px",
                marginTop: "8px"
              }}>
                <span style={{ color: "#6b7280" }}>Ваш ответ: </span>
                <span style={{ 
                  color: result.isCorrect ? "#10b981" : "#ef4444",
                  fontWeight: "500"
                }}>
                  {result.userAnswer}
                </span>
              </div>
              
              {!result.isCorrect && (
                <div style={{
                  fontSize: "14px",
                  marginTop: "8px"
                }}>
                  <span style={{ color: "#6b7280" }}>Правильный ответ: </span>
                  <span style={{ 
                    color: "#10b981",
                    fontWeight: "500"
                  }}>
                    {result.correctAnswer}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Кнопки действий */}
        <div style={{ 
          display: "flex", 
          gap: "16px",
          marginTop: "32px"
        }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              flex: 1,
              padding: "14px 16px",
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
            На главную
          </button>
        </div>
      </div>
    </div>
  );
}