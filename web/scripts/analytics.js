let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

function getDailyExpenses() {
    const dailyData = {};
    
    expenses.forEach(expense => {
        const date = formatDateForChart(expense.date);
        if (!dailyData[date]) {
            dailyData[date] = 0;
        }
        dailyData[date] += expense.amount;
    });
    
    const sortedDates = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b));
    
    const labels = sortedDates.map(date => formatDateDisplay(date));
    const data = sortedDates.map(date => dailyData[date]);
    
    return { labels, data };
}

function getCategoryExpenses() {
    const categoryData = {};
    
    expenses.forEach(expense => {
        const category = expense.category;
        if (!categoryData[category]) {
            categoryData[category] = 0;
        }
        categoryData[category] += expense.amount;
    });
    
    const labels = Object.keys(categoryData);
    const data = labels.map(category => categoryData[category]);
    
    return { labels, data };
}

function formatDateForChart(dateString) {
    return dateString;
}

function formatDateDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

function createDailyChart() {
    const ctx = document.getElementById('dailyChart').getContext('2d');
    const chartData = getDailyExpenses();
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Расходы по дням (руб)',
                data: chartData.data,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Динамика расходов'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Сумма (руб)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Дата'
                    }
                }
            }
        }
    });
}

function createCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const chartData = getCategoryExpenses();
    
    const backgroundColors = generateColors(chartData.labels.length);
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                },
                title: {
                    display: true,
                    text: 'Распределение по категориям'
                }
            }
        }
    });
}

function generateColors(count) {
    const colors = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', 
        '#9b59b6', '#1abc9c', '#d35400', '#34495e'
    ];
    return colors.slice(0, count);
}

function updateStatistics() {
    if (expenses.length === 0) {
        document.getElementById('totalSpent').textContent = '0 руб';
        document.getElementById('averagePerDay').textContent = '0 руб';
        document.getElementById('maxPerDay').textContent = '0 руб';
        document.getElementById('mostExpensiveCategory').textContent = '-';
        return;
    }
    
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById('totalSpent').textContent = `${totalSpent.toFixed(2)} руб`;
    
    const dailyData = getDailyExpenses();
    const averagePerDay = totalSpent / dailyData.labels.length;
    document.getElementById('averagePerDay').textContent = `${averagePerDay.toFixed(2)} руб`;
    
    const maxPerDay = Math.max(...dailyData.data);
    document.getElementById('maxPerDay').textContent = `${maxPerDay.toFixed(2)} руб`;
    
    const categoryData = getCategoryExpenses();
    const maxIndex = categoryData.data.indexOf(Math.max(...categoryData.data));
    document.getElementById('mostExpensiveCategory').textContent = 
        categoryData.labels[maxIndex] + ` (${categoryData.data[maxIndex].toFixed(2)} руб)`;
}

document.addEventListener('DOMContentLoaded', () => {
    if (expenses.length > 0) {
        createDailyChart();
        createCategoryChart();
        updateStatistics();
    } else {
        document.querySelector('.content').innerHTML += `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <h3>Нет данных для анализа</h3>
                <p>Добавьте первые расходы на главной странице</p>
            </div>
        `;
    }
});