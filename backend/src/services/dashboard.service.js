const Transaction = require("../models/Transaction");
const { buildSafetySummary } = require("../utils/financialSafety");

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

async function getDashboard(userId) {
  const monthTransactions = await Transaction.find({
    userId,
    timestamp: {
      $gte: startOfMonth(),
    },
  }).sort({ timestamp: -1 });

  const totalIncome = monthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpense = monthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = totalIncome - totalExpense;
  const safety = buildSafetySummary({ income: totalIncome, expense: totalExpense });

  const expenseByCategory = monthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((accumulator, transaction) => {
      accumulator[transaction.category] = (accumulator[transaction.category] || 0) + transaction.amount;
      return accumulator;
    }, {});

  const topCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0];

  return {
    totalIncome,
    totalExpense,
    balance,
    safety,
    insights: [
      topCategory
        ? `Most spending is going to ${topCategory[0]} (${Math.round(topCategory[1])}).`
        : "No major category trend yet.",
      safety.message,
    ],
    recentTransactions: monthTransactions.slice(0, 5),
  };
}

module.exports = {
  getDashboard,
};

