import React from "react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div style={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "100px 20px",
      color: "#fff",
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      {/* Герой-секция */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          textAlign: "center",
          marginBottom: "80px"
        }}
      >
        <h1 style={{
          fontSize: "3.5rem",
          fontWeight: 800,
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "20px",
          lineHeight: 1.2
        }}>
          Финансовый Помощник
        </h1>
        <p style={{
          fontSize: "1.5rem",
          color: "#d1d5db",
          maxWidth: "800px",
          margin: "0 auto 30px",
          lineHeight: 1.6
        }}>
          Менеджмент нового поколения
        </p>
        <p style={{
          fontSize: "1.2rem",
          color: "#9ca3af",
          maxWidth: "700px",
          margin: "0 auto 40px",
          lineHeight: 1.7
        }}>
          <strong>Контролируйте финансы легко, анализируйте умно, достигайте большего.</strong>
        </p>
        
        <div style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            style={{
              padding: "16px 32px",
              fontSize: "1.1rem",
              fontWeight: 600,
              background: "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            🎯 Начать бесплатно
          </motion.button>
        </div>
      </motion.div>

      {/* Ключевые возможности */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          marginBottom: "100px"
        }}
      >
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "60px",
          color: "#fff"
        }}>
          Ключевые возможности
        </h2>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "30px"
        }}>
          {[
            {
              icon: "🎯",
              title: "Персональный учет расходов",
              description: "Интуитивный интерфейс для ежедневного учета трат с умным календарем"
            },
            {
              icon: "📈",
              title: "Живая аналитика",
              description: "Автоматические графики и диаграммы для понимания структуры расходов"
            },
            {
              icon: "🎮",
              title: "Обучение через игру",
              description: "Мини-игры и тесты для развития финансовой дисциплины"
            },
            {
              icon: "🔒",
              title: "Безопасность",
              description: "Работа в гостевом режиме или защищенном аккаунте"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              style={{
                background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                padding: "30px",
                borderRadius: "20px",
                border: "1px solid #334155",
                transition: "all 0.3s ease"
              }}
            >
              <div style={{
                fontSize: "2.5rem",
                marginBottom: "20px"
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                marginBottom: "15px",
                color: "#fff"
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: "#cbd5e1",
                lineHeight: 1.6
              }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Для кого создан */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
          padding: "50px",
          borderRadius: "25px",
          marginBottom: "100px"
        }}
      >
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "40px",
          color: "#fff"
        }}>
          Для кого создан Финансовый Помощник?
        </h2>
        
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "15px"
        }}>
          {["Для начинающих", "Для практиков", "Для аналитиков", "Для геймеров", "Для всех, кто хочет контроля"].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                padding: "15px 25px",
                borderRadius: "50px",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            >
              <span style={{ fontSize: "1.1rem", color: "#fff" }}>✅ {item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Стадия развития */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        style={{
          marginBottom: "100px"
        }}
      >
        <div style={{
          textAlign: "center",
          marginBottom: "50px"
        }}>
          <h2 style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "20px"
          }}>
            Проект в активной разработке — это только начало!
          </h2>
          <p style={{
            fontSize: "1.2rem",
            color: "#cbd5e1",
            maxWidth: "800px",
            margin: "0 auto"
          }}>
            <strong>Мы только разогреваемся!</strong> Текущая версия — это мощный MVP с полным фронтенд-функционалом.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
          marginBottom: "50px"
        }}>
          {[
            {
              icon: "🔜",
              title: "Скоро: Бэкенд и облако",
              features: ["Синхронизация между устройствами", "Резервное копирование", "Облачное хранение"],
              color: "#3b82f6"
            },
            {
              icon: "📱",
              title: "В разработке: Мобильное приложение",
              features: ["Уведомления о тратах", "Быстрый ввод 'на ходу'", "Оффлайн-доступ"],
              color: "#8b5cf6"
            },
            {
              icon: "💡",
              title: "В концепте: ИИ-ассистент",
              features: ["Автокатегоризация расходов", "Прогноз трат", "Персональные рекомендации"],
              color: "#10b981"
            }
          ].map((plan, index) => (
            <div
              key={index}
              style={{
                background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                padding: "30px",
                borderRadius: "20px",
                border: "1px solid #334155",
                height: "100%"
              }}
            >
              <div style={{
                fontSize: "2.5rem",
                marginBottom: "20px"
              }}>
                {plan.icon}
              </div>
              <h3 style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                marginBottom: "20px",
                color: "#fff"
              }}>
                {plan.title}
              </h3>
              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0
              }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{
                    marginBottom: "12px",
                    color: "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: plan.color
                    }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Бонус для ранних пользователей */}
        <div style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          padding: "40px",
          borderRadius: "20px",
          textAlign: "center",
          margin: "150px auto",
          maxWidth: "500px",
        }}>
          <h3 style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "20px",
            color: "#fff"
          }}>
            🎁 Специально для первых пользователей
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            color: "#fff"
          }}>
            {[
              "Влияние на развитие проекта",
              "Приоритетная поддержка"
            ].map((bonus, index) => (
              <div key={index} style={{
                background: "rgba(255, 255, 255, 0.1)",
                padding: "15px",
                borderRadius: "10px",
                backdropFilter: "blur(10px)"
              }}>
                {bonus}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Цитата и призыв к действию */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{
          textAlign: "center",
          marginBottom: "60px"
        }}
      >
        <blockquote style={{
          fontSize: "1.5rem",
          color: "#d1d5db",
          fontStyle: "italic",
          maxWidth: "800px",
          margin: "0 auto 40px",
          padding: "30px",
          borderLeft: "4px solid #3b82f6",
          background: "rgba(59, 130, 246, 0.1)",
          borderRadius: "0 15px 15px 0"
        }}>
          "Лучшее время начать контролировать финансы — год назад. Второе лучшее время — сейчас."
        </blockquote>
        <p>
        — автор проекта
        </p>
      </motion.div>

      {/* Финальный призыв */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        style={{
          textAlign: "center",
          marginTop:"150px",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          padding: "60px 40px",
          borderRadius: "25px",
          border: "2px solid #334155"
        }}
      >
        <h2 style={{
          fontSize: "2.2rem",
          fontWeight: 800,
          marginBottom: "20px",
          color: "#fff"
        }}>
          Начните свой путь к финансовой победе
        </h2>
        <p style={{
          fontSize: "1.3rem",
          color: "#cbd5e1",
          marginBottom: "40px",
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          Бесплатно, без ограничений, с мгновенным результатом!
        </p>
        
        <div style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            style={{
              padding: "18px 40px",
              fontSize: "1.2rem",
              fontWeight: 700,
              background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
              color: "white",
              border: "none",
              borderRadius: "15px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            🚀 Начать бесплатно
          </motion.button>

        </div>
      </motion.div>

      {/* Футер страницы */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        style={{
          textAlign: "center",
          marginTop: "80px",
          paddingTop: "40px",
          borderTop: "1px solid #334155",
          color: "#9ca3af"
        }}
      >
        <p style={{ fontSize: "0.9rem", marginBottom: "10px" }}>
          Финансовый Помощник © {new Date().getFullYear()} | Менеджмент нового поколения
        </p>
        <p style={{ fontSize: "0.8rem" }}>
          Присоединяйтесь к ранним пользователям и меняйте свои финансы вместе с нами
        </p>
      </motion.div>
    </div>
  );
}