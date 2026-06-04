const Transaction = require("../models/Transaction");
const { buildSafetySummary } = require("../utils/financialSafety");

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function shiftDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function getInsights(userId) {
  const today = new Date();
  const currentWeekStart = shiftDays(startOfDay(today), -6);
  const previousWeekStart = shiftDays(currentWeekStart, -7);

  const transactions = await Transaction.find({
    userId,
    timestamp: {
      $gte: previousWeekStart,
    },
  }).sort({ timestamp: -1 });

  const expenses = transactions.filter((transaction) => transaction.type === "expense");
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expenseTotal = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);

  const categoryTotals = expenses.reduce((accumulator, transaction) => {
    accumulator[transaction.category] = (accumulator[transaction.category] || 0) + transaction.amount;
    return accumulator;
  }, {});

  const categoryBreakdown = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: expenseTotal ? Number(((amount / expenseTotal) * 100).toFixed(1)) : 0,
    }));

  const currentWeekExpense = expenses
    .filter((transaction) => new Date(transaction.timestamp) >= currentWeekStart)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const previousWeekExpense = expenses
    .filter((transaction) => {
      const timestamp = new Date(transaction.timestamp);
      return timestamp >= previousWeekStart && timestamp < currentWeekStart;
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const weeklyChange = previousWeekExpense
    ? Number((((currentWeekExpense - previousWeekExpense) / previousWeekExpense) * 100).toFixed(1))
    : 100;

  const safety = buildSafetySummary({ income, expense: expenseTotal });
  const alerts = [safety.message];

  if (categoryBreakdown[0] && categoryBreakdown[0].percentage >= 40) {
    alerts.push(`Your ${categoryBreakdown[0].category} spend is taking a large share of your budget.`);
  }

  return {
    categoryBreakdown,
    weeklyComparison: {
      currentWeekExpense,
      previousWeekExpense,
      percentageChange: weeklyChange,
    },
    alerts,
  };
}

module.exports = {
  getInsights,
};

