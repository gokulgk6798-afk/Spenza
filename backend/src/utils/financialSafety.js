function buildSafetySummary({ income, expense }) {
  const safeIncome = income > 0 ? income : 0;
  const ratio = safeIncome === 0 ? (expense > 0 ? 1 : 0) : expense / safeIncome;
  const savings = income - expense;

  let status = "healthy";
  let message = "You have room to spend thoughtfully this month.";

  if (ratio >= 1) {
    status = "critical";
    message = "You are over your income for this period. Reduce spending immediately.";
  } else if (ratio >= 0.9) {
    status = "warning";
    message = "You are nearing your financial limit.";
  } else if (savings <= 0) {
    status = "warning";
    message = "Your savings are flat right now. Try to create a small buffer.";
  }

  return {
    status,
    message,
    expenseRatio: Number((ratio * 100).toFixed(1)),
    savings,
  };
}

module.exports = {
  buildSafetySummary,
};

