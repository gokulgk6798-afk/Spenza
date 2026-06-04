const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const HttpError = require("../utils/httpError");
const mongoose = require("mongoose");

const defaultBudgets = [
  { category: "food", name: "Food", icon: "fast-food-outline", limit: 5000, color: "#FF5533" },
  { category: "transport", name: "Transport", icon: "car-outline", limit: 3000, color: "#F59E0B" },
  { category: "entertainment", name: "Entertainment", icon: "film-outline", limit: 2000, color: "#FF5533" },
  { category: "groceries", name: "Groceries", icon: "cart-outline", limit: 5000, color: "#FF5533" },
  { category: "medical", name: "Medical", icon: "medical-outline", limit: 2000, color: "#FF5533" },
];

function startOfMonth(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

async function ensureDefaultBudgets(userId) {
  const count = await Budget.countDocuments({ userId });
  if (count > 0) return;
  await Budget.insertMany(defaultBudgets.map((budget) => ({ ...budget, userId })), {
    ordered: false,
  }).catch(() => undefined);
}

async function buildSpentMap(userId) {
  const objectUserId = new mongoose.Types.ObjectId(userId);
  const rows = await Transaction.aggregate([
    {
      $match: {
        userId: objectUserId,
        type: "expense",
        timestamp: { $gte: startOfMonth() },
      },
    },
    { $group: { _id: "$category", spent: { $sum: "$amount" } } },
  ]);
  return rows.reduce((map, row) => {
    map[row._id] = row.spent;
    return map;
  }, {});
}

async function listBudgets(userId) {
  await ensureDefaultBudgets(userId);
  const [budgets, spentMap] = await Promise.all([
    Budget.find({ userId }).sort({ createdAt: 1 }),
    buildSpentMap(userId),
  ]);
  return budgets.map((budget) => ({
    id: budget._id.toString(),
    category: budget.category,
    name: budget.name,
    icon: budget.icon,
    limit: budget.limit,
    color: budget.color,
    spent: spentMap[budget.category] || 0,
  }));
}

async function createBudget(userId, payload) {
  const name = payload.name?.trim() || "New Budget";
  const category = (payload.category?.trim().toLowerCase() || name.toLowerCase()).replace(/\s+/g, "-");
  const limit = Number(payload.limit);
  if (!Number.isFinite(limit) || limit <= 0) {
    throw new HttpError(400, "Budget limit must be a positive number.");
  }
  await Budget.create({
    userId,
    category,
    name,
    limit: Math.round(limit),
    icon: payload.icon?.trim() || "sparkles-outline",
    color: payload.color?.trim() || "#FF5533",
  });
  return listBudgets(userId);
}

async function updateBudget(userId, budgetId, payload) {
  const budget = await Budget.findOne({ _id: budgetId, userId });
  if (!budget) {
    throw new HttpError(404, "Budget not found.");
  }

  if (payload.name !== undefined) budget.name = payload.name.trim() || budget.name;
  if (payload.category !== undefined) budget.category = payload.category.trim().toLowerCase() || budget.category;
  if (payload.icon !== undefined) budget.icon = payload.icon.trim() || budget.icon;
  if (payload.color !== undefined) budget.color = payload.color.trim() || budget.color;
  if (payload.limit !== undefined) {
    const limit = Number(payload.limit);
    if (!Number.isFinite(limit) || limit <= 0) {
      throw new HttpError(400, "Budget limit must be a positive number.");
    }
    budget.limit = Math.round(limit);
  }

  await budget.save();
  return listBudgets(userId);
}

module.exports = {
  createBudget,
  listBudgets,
  updateBudget,
};
