const asyncHandler = require("../utils/asyncHandler");
const budgetService = require("../services/budget.service");

const listBudgets = asyncHandler(async (req, res) => {
  res.status(200).json({ budgets: await budgetService.listBudgets(req.user.id) });
});

const createBudget = asyncHandler(async (req, res) => {
  res.status(201).json({ budgets: await budgetService.createBudget(req.user.id, req.body) });
});

const updateBudget = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json({ budgets: await budgetService.updateBudget(req.user.id, req.params.id, req.body) });
});

module.exports = {
  createBudget,
  listBudgets,
  updateBudget,
};
