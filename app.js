let expenses = [];
let incomes = [];

// Load income and expenses from localStorage when the page loads
window.onload = function() {
    if (window.location.pathname.endsWith('index.html')) {
        const income = parseFloat(localStorage.getItem('income')) || 0;
        document.getElementById('total-income').querySelector('p').textContent = `$${income.toFixed(2)}`;

        const savedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses = savedExpenses;
        updateExpenseList();
        updatePieChart();
        updateIncomeExpenseLineChart();
        updateTotalExpense();
    }

    if (window.location.pathname.endsWith('income.html')) {
        const income = parseFloat(localStorage.getItem('income')) || 0;
        document.getElementById('total-income').querySelector('p').textContent = `$${income.toFixed(2)}`;
    }

    if (window.location.pathname.endsWith('expense.html')) {
        const savedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses = savedExpenses;
        updateExpenseList();
        updateTotalExpense();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        fetchProfile(token);
    }

    // Fetch user profile
    async function fetchProfile(token) {
        try {
            const response = await fetch('http://localhost:5000/api/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const user = await response.json();
            console.log(user);
            // Display user data on the page
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    }

    // Handle Google login
    document.getElementById('google-login').addEventListener('click', () => {
        window.location.href = 'http://localhost:5000/api/auth/google';
    });

    // Handle Apple login
    document.getElementById('apple-login').addEventListener('click', () => {
        window.location.href = 'http://localhost:5000/api/auth/apple';
    });
});

function addIncome() {
    const source = document.getElementById('income-source').value;
    const amount = parseFloat(document.getElementById('income-amount').value);

    if (source && !isNaN(amount) && amount > 0) {
        incomes.push({ source, amount });
        localStorage.setItem('income', (parseFloat(localStorage.getItem('income') || 0) + amount).toFixed(2));
        updateIncomeList();
        updateTotalIncome();
        updateIncomeExpenseLineChart(); // Update line chart after adding income
    }
}

function addExpense() {
    const name = document.getElementById('expense-name').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);

    if (name && !isNaN(amount) && amount > 0) {
        const existingExpense = expenses.find(expense => expense.name === name);
        if (existingExpense) {
            existingExpense.amount += amount;
        } else {
            expenses.push({ name, amount });
        }

        // Save expenses to localStorage
        localStorage.setItem('expenses', JSON.stringify(expenses));

        // Update expenses on the index.html page if currently on that page
        if (window.location.pathname.endsWith('index.html')) {
            updateExpenseList();
            updatePieChart();
            updateIncomeExpenseLineChart();
            updateTotalExpense();
        }

        // Check expenses against income
        checkExpensesAgainstIncome();
    }
}

function updateIncomeList() {
    const incomeList = document.getElementById('income-list');
    incomeList.innerHTML = '';

    incomes.forEach(income => {
        const li = document.createElement('li');
        li.textContent = `${income.source}: $${income.amount.toFixed(2)}`;
        incomeList.appendChild(li);
    });
}

function updateExpenseList() {
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '';

    // Get the 2 latest expenses
    const latestExpenses = expenses.slice(-2);

    latestExpenses.forEach(expense => {
        const li = document.createElement('li');
        li.textContent = `${expense.name}: $${expense.amount.toFixed(2)}`;
        expenseList.appendChild(li);
    });
}

function updatePieChart() {
    const ctx = document.getElementById('expense-pie-chart').getContext('2d');
    const labels = expenses.map(expense => expense.name);
    const data = expenses.map(expense => expense.amount);

    if (window.expensePieChart) {
        window.expensePieChart.destroy();
    }

    window.expensePieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateIncomeExpenseLineChart() {
    const ctx = document.getElementById('income-expense-line-chart').getContext('2d');
    const labels = [...new Set(expenses.map(expense => expense.name))]; // Ensure unique labels for X-axis
    const totalIncome = parseFloat(localStorage.getItem('income')) || 0;
    const incomeData = new Array(labels.length).fill(totalIncome); // Income line across all labels
    const expenseData = expenses.map(expense => expense.amount);

    if (window.incomeExpenseLineChart) {
        window.incomeExpenseLineChart.destroy();
    }

    window.incomeExpenseLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Income',
                data: incomeData,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }, {
                label: 'Expenses',
                data: expenseData,
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    suggestedMax: 50000 , // Highest income value
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Expense'
                    }
                }
            }
        }
    });
}

function updateTotalIncome() {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    document.getElementById('total-income').querySelector('p').textContent = `$${totalIncome.toFixed(2)}`;
}

function updateTotalExpense() {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById('total-expense').querySelector('p').textContent = `$${totalExpenses.toFixed(2)}`;
}

function checkExpensesAgainstIncome() {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

    if (totalExpenses > totalIncome) {
        alert("Warning: You are exceeding your total income with expenses!");
    }
}
	