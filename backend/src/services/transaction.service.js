const Transaction = require("../models/Transaction");
const HttpError = require("../utils/httpError");
const { findDuplicate } = require("../utils/deduplication");
const { parseTransactionText } = require("../utils/transactionParser");

function normalizePayload(payload = {}) {
  return {
    amount: Number(payload.amount),
    type: payload.type || "expense",
    category: payload.category || "other",
    vendor: payload.vendor || "",
    timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
    source: payload.source || "chat",
    rawText: payload.rawText || payload.text || "",
  };
}

function validateTransaction(transaction) {
  if (!transaction.amount || Number.isNaN(transaction.amount)) {
    throw new HttpError(400, "A valid amount is required.");
  }
}

async function parseInput(text) {
  const parsed = parseTransactionText(text);

  if (!parsed.amount) {
    throw new HttpError(400, "Could not detect an amount from the message.");
  }

  return parsed;
}

async function createTransaction(userId, payload) {
  const parsed = payload.text ? await parseInput(payload.text) : null;
  const normalized = normalizePayload({
    ...parsed,
    ...payload,
  });

  validateTransaction(normalized);

  const duplicateWindowStart = new Date(normalized.timestamp.getTime() - 5 * 60 * 1000);
  const duplicateWindowEnd = new Date(normalized.timestamp.getTime() + 5 * 60 * 1000);

  const potentialDuplicates = await Transaction.find({
    userId,
    amount: normalized.amount,
    timestamp: {
      $gte: duplicateWindowStart,
      $lte: duplicateWindowEnd,
    },
  }).sort({ timestamp: -1 });

  const duplicate = findDuplicate(potentialDuplicates, normalized);

  if (duplicate) {
    duplicate.vendor = duplicate.vendor || normalized.vendor;
    if (!duplicate.category || duplicate.category === "other") {
      duplicate.category = normalized.category;
    }
    duplicate.rawText = duplicate.rawText || normalized.rawText;
    duplicate.sources = Array.from(new Set([...(duplicate.sources || [duplicate.source]), normalized.source]));
    duplicate.mergeCount += 1;
    await duplicate.save();

    return {
      transaction: duplicate,
      duplicateMerged: true,
    };
  }

  const transaction = await Transaction.create({
    userId,
    ...normalized,
    sources: [normalized.source],
  });

  return {
    transaction,
    duplicateMerged: false,
  };
}

async function getTransactions(userId, filters = {}) {
  const query = {
    userId,
  };

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.from || filters.to) {
    query.timestamp = {};
    if (filters.from) {
      query.timestamp.$gte = new Date(filters.from);
    }
    if (filters.to) {
      query.timestamp.$lte = new Date(filters.to);
    }
  }

  return Transaction.find(query).sort({ timestamp: -1, createdAt: -1 });
}

module.exports = {
  parseInput,
  createTransaction,
  getTransactions,
};
