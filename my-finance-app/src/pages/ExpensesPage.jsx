import React, { useState, useRef, useEffect } from "react";
import ExpenseCard from "../components/ExpenseCard";
import MiniSummary from "../components/MiniSummary";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const CustomCalendar = ({ onSelectDate, onClose, existingDates, currentCardDate, todayDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateForCompare = new Date(dateStr);
    dateForCompare.setHours(0, 0, 0, 0);
    
    const isToday = dateStr === todayDate;
    const isCurrentCard = dateStr === currentCardDate;
    const isExisting = existingDates.includes(dateStr);
    const isFuture = dateForCompare > today;
    const isDisabled = isExisting || isFuture;
    
    days.push({
      day: i,
      date: dateStr,
      dateForCompare,
      isToday,
      isCurrentCard,
      isDisabled
    });
  }
  
  const firstDayOfWeek = firstDay.getDay();
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #333'
    }}>
      {/* Заголовок с навигацией */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <button 
          onClick={prevMonth}
          style={{
            background: 'none',
            border: 'none',
            color: '#4a90e2',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px 10px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ‹
        </button>
        
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ 
            margin: 0, 
            color: '#fff',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            {monthNames[month]} {year}
          </h3>
        </div>
        
        <button 
          onClick={nextMonth}
          style={{
            background: 'none',
            border: 'none',
            color: '#4a90e2',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px 10px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ›
        </button>
      </div>
      
      {/* Кнопка закрытия */}
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'none',
          border: 'none',
          color: '#999',
          fontSize: '24px',
          cursor: 'pointer',
          padding: '0',
          lineHeight: 1,
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ×
      </button>
      
      {/* Дни недели */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        marginBottom: '10px'
      }}>
        {weekdays.map(day => (
          <div key={day} style={{
            textAlign: 'center',
            color: '#999',
            fontSize: '13px',
            padding: '5px 0',
            fontWeight: '500'
          }}>
            {day}
          </div>
        ))}
      </div>
      
      {/* Дни месяца */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px'
      }}>
        {/* Пустые ячейки для начала месяца */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        
        {/* Дни */}
        {days.map(({ day, date, isToday, isCurrentCard, isDisabled }) => (
          <button
            key={date}
            onClick={() => !isDisabled && onSelectDate(date)}
            disabled={isDisabled}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: isCurrentCard ? '2px solid #4a90e2' : 'none',
              background: isToday ? '#4a90e2' : isDisabled ? '#333' : 'transparent',
              color: isToday ? 'white' : isDisabled ? '#666' : '#e0e0e0',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isDisabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.background = isToday ? '#3a80d2' : '#2a2a2a';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.background = isToday ? '#4a90e2' : 'transparent';
              }
            }}
            title={isDisabled ? (existingDates.includes(date) ? 'Уже добавлено' : 'Будущая дата') : ''}
          >
            {day}
            {/* Индикатор для уже существующих дней */}
            {existingDates.includes(date) && !isToday && (
              <div style={{
                position: 'absolute',
                bottom: '3px',
                width: '4px',
                height: '4px',
                background: '#ff6b6b',
                borderRadius: '50%'
              }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function ExpensesPage({ days, setDays }) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Загрузка категорий из localStorage (минимальный ключ)
  const [categories, setCategories] = useState(() => {
    try {
      const raw = localStorage.getItem("app_categories");
      return raw ? JSON.parse(raw) : ["Еда", "Дом"];
    } catch {
      return ["Еда", "Дом"];
    }
  });

  // Сохраняем категории в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem("app_categories", JSON.stringify(categories));
    } catch (e) { /* ignore */ }
  }, [categories]);

  // слайдер параметры
  const CARD_WIDTH = 500;
  const CARD_GAP = 20;
  const [currentIndex, setCurrentIndex] = useState(0);

  const addDay = (date) => {
    if (!date) return;
    if (days.some(d => d.date === date)) {
      alert("День с этой датой уже существует!");
      return;
    }
    const newDays = [...days, { date, expenses: [] }];
    const sorted = newDays.sort((a, b) => new Date(a.date) - new Date(b.date));
    setDays(sorted);
    
    // Прокручиваем к новой карточке
    const idx = sorted.findIndex(d => d.date === date);
    setCurrentIndex(idx >= 0 ? idx : 0);
    
    // Закрываем календарь
    setCalendarOpen(false);
  };

  // Получаем сегодняшнюю дату в формате YYYY-MM-DD с исправлением временной зоны
  const getTodayDate = () => {
    const today = new Date();
    // Используем локальное время, а не UTC
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Проверка, является ли дата сегодняшней
  const isToday = (dateStr) => {
    return dateStr === getTodayDate();
  };

  // Суммы по дням
  const dailyTotals = days.map(day => ({
    date: day.date,
    total: day.expenses.reduce((a,b) => a+b.amount, 0)
  }));

  const dailyData = {
    labels: dailyTotals.map(d => d.date),
    datasets: [
      {
        label: "Расходы по дням",
        data: dailyTotals.map(d => d.total),
        backgroundColor: "rgba(75,192,192,0.6)"
      }
    ]
  };

  // Суммы по категориям
  const categoryTotals = {};
  days.forEach(day => {
    day.expenses.forEach(exp => {
      if (!categoryTotals[exp.category]) categoryTotals[exp.category] = 0;
      categoryTotals[exp.category] += exp.amount;
    });
  });

  const categoryData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      label: "По категориям",
      data: Object.values(categoryTotals),
      backgroundColor: [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"
      ]
    }]
  };

  const prevCard = () => setCurrentIndex(i => Math.max(0, i - 1));
  const nextCard = () => setCurrentIndex(i => Math.min(days.length - 1, i + 1));

  const sortedDays = [...days].sort((a, b) => new Date(a.date) - new Date(b.date));
  const existingDates = days.map(day => day.date);
  const currentCardDate = sortedDays[currentIndex]?.date || '';
  const todayDate = getTodayDate();

  // Отладочная информация
  console.log("TODAY DATE:", todayDate);
  console.log("CURRENT CARD DATE:", currentCardDate);
  console.log("EXISTING DATES:", existingDates);

  return (
    <div style={{ 
      position: "relative",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      minHeight: "100vh",
      padding: "100px",
      boxSizing: "border-box"
    }}>
      <div style={{display: "flex", flexDirection: "row"}}>
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          marginLeft: "100px",
          width: "50%"
        }}>
          <h1 style={{ color: "#fff" }}>Учёт расходов</h1>

          <div style={{ marginBottom: 20, position: "relative" }}>
            <button 
              onClick={() => setCalendarOpen(!calendarOpen)} 
              style={{ 
                padding: "10px 20px", 
                borderRadius: 8,
                background: "#1f6feb",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: 600
              }}
            >
              + Добавить день
            </button>
            
            {/* Модальное окно с кастомным календарем */}
            {calendarOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                zIndex: 1000,
                marginTop: "10px",
                background: "transparent",
                borderRadius: "12px"
              }}>
                <CustomCalendar
                  onSelectDate={addDay}
                  onClose={() => setCalendarOpen(false)}
                  existingDates={existingDates}
                  currentCardDate={currentCardDate}
                  todayDate={todayDate}
                />
              </div>
            )}
          </div>

          {/* Слайдер карточек */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <button 
              onClick={prevCard} 
              disabled={currentIndex === 0} 
              style={{ marginRight: 10 }}
            >
              ←
            </button>
            
            <div style={{ overflow: "hidden", width: 500 }}>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  transition: "transform 0.45s cubic-bezier(.2,.9,.2,1)",
                  transform: `translateX(-${(500 + 20) * currentIndex}px)`
                }}
              >
                {sortedDays.map(day => (
                  <div key={day.date} style={{ width: 500, flexShrink: 0 }}>
                    <ExpenseCard
                      dayData={day}
                      updateDay={updatedDay => {
                        const newDays = days.map(d => d.date === updatedDay.date ? updatedDay : d);
                        setDays(newDays);
                      }}
                      // categories={categories}
                      // setCategories={setCategories}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={nextCard} 
              disabled={currentIndex === sortedDays.length - 1} 
              style={{ marginLeft: 10 }}
            >
              →
            </button>
          </div>
        </div>
        {/* Сводка */}
        <div style={{ 
          marginTop: "200px",
          marginLeft: "100px",
          display: "flex",
          width: "400px",
          height: "fit-content"
        }}>
          <MiniSummary days={days} />
        </div>
      </div>
      {/* Графики аналитики */}
      {days.length > 0 && (
        <div style={{  textAlign: "center", marginLeft: "100px", width: "50%", marginTop: "60px" }}>
          <h1 style={{ color: "#fff", marginBottom: "30px" }}>Аналитика</h1>
          <div style={{ marginTop: "30px", display: "flex", flexDirection: "row", gap: "40px" }}>
            <div style={{ 
              maxWidth: "500px",
              marginBottom: "40px",
              background: "#1a1a1a",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #333"
            }}>
              <h3 style={{ color: "#fff", marginBottom: "15px" }}>Расходы по дням</h3>
              <Bar data={dailyData} />
            </div>
            <div style={{ 
              maxWidth: "500px",
              background: "#1a1a1a",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #333"
            }}>
              <h3 style={{ color: "#fff", marginBottom: "15px" }}>Расходы по категориям</h3>
              <Pie data={categoryData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}