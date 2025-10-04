let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

const expensesTableBody = document.getElementById('expensesTableBody');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const expenseModal = document.getElementById('expenseModal');
const closeModal = document.querySelector('.close');
const expenseForm = document.getElementById('expenseForm');
const todayExpensesEl = document.getElementById('todayExpenses');
const topCategoryEl = document.getElementById('topCategory');
const recommendationEl = document.getElementById('recommendation');
const currentDateEl = document.getElementById('currentDate');

addExpenseBtn.addEventListener('click', () => {
    expenseModal.style.display = 'block';
    document.getElementById('expenseDate').valueAsDate = new Date();
});

closeModal.addEventListener('click', () => {
    expenseModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == expenseModal) {
        expenseModal.style.display = 'none';
    }
});

expenseForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const newExpense = {
        id: Date.now(),
        date: document.getElementById('expenseDate').value,
        title: document.getElementById('expenseTitle').value,
        category: document.getElementById('expenseCategory').value,
        amount: parseFloat(document.getElementById('expenseAmount').value)
    };

    expenses.push(newExpense);
    saveExpenses();
    renderExpenses();
    updateAnalytics();
    expenseModal.style.display = 'none';
    expenseForm.reset();
});

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function renderExpenses() {
    expensesTableBody.innerHTML = '';

    if (expenses.length === 0) {
        expensesTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Нет данных о расходах</td></tr>';
        return;
    }

    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedExpenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>${expense.title}</td>
            <td>${expense.category}</td>
            <td>${expense.amount.toFixed(2)} руб.</td>
            <td><button class="delete-btn" data-id="${expense.id}">Удалить</button></td>
        `;
        expensesTableBody.appendChild(row);
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = parseInt(event.target.getAttribute('data-id'));
            deleteExpense(id);
        });
    });
}

function deleteExpense(id) {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
        expenses = expenses.filter(expense => expense.id !== id);
        saveExpenses();
        renderExpenses();
        updateAnalytics();
    }
}

function updateAnalytics() {
    const today = new Date().toISOString().split('T')[0];
    const todayTotal = expenses
        .filter(expense => expense.date === today)
        .reduce((sum, expense) => sum + expense.amount, 0);
    todayExpensesEl.textContent = `${todayTotal.toFixed(2)} руб.`;

    const categoryCount = {};
    expenses.forEach(expense => {
        categoryCount[expense.category] = (categoryCount[expense.category] || 0) + 1;
    });
    let topCategory = '-';
    let maxCount = 0;
    for (const category in categoryCount) {
        if (categoryCount[category] > maxCount) {
            maxCount = categoryCount[category];
            topCategory = category;
        }
    }
    topCategoryEl.textContent = topCategory;

    if (expenses.length === 0) {
        recommendationEl.textContent = 'Добавьте первые данные для анализа.';
    } else if (todayTotal > 1000) {
        recommendationEl.textContent = 'Сегодня вы потратили много! Советуем быть экономнее.';
    } else {
        recommendationEl.textContent = 'Ваши расходы выглядят хорошо!';
    }

}

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

currentDateEl.textContent = new Date().toLocaleDateString('ru-RU');

document.addEventListener('DOMContentLoaded', () => {
    renderExpenses();
    updateAnalytics();
});