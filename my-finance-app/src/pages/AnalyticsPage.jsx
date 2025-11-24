import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function AnalyticsPage({ days }) {
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

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Аналитика</h1>
      <div style={{ maxWidth: "600px", marginBottom: "40px" }}>
        <Bar data={dailyData} />
      </div>
      <div style={{ maxWidth: "400px" }}>
        <Pie data={categoryData} />
      </div>
    </div>
  );
}
