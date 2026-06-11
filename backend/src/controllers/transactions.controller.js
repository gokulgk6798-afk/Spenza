const asyncHandler = require("../utils/asyncHandler");
const transactionService = require("../services/transaction.service");

const parseTransaction = asyncHandler(async (req, res) => {
  const result = await transactionService.parseInput(req.body.text || "");
  res.status(200).json(result);
});

const detectSmsTransactions = asyncHandler(async (req, res) => {
  const suggestions = await transactionService.detectSmsTransactions(req.body.messages || []);
  res.status(200).json({ suggestions });
});

const createTransaction = asyncHandler(async (req, res) => {
  const result = await transactionService.createTransaction(req.user.id, req.body);
  res.status(201).json(result);
});

const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await transactionService.getTransactions(req.user.id, req.query);
  res.status(200).json({ transactions });
});

module.exports = {
  parseTransaction,
  detectSmsTransactions,
  createTransaction,
  getTransactions,
};
