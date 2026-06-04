const test = require("node:test");
const assert = require("node:assert/strict");
const { parseTransactionText } = require("../src/utils/transactionParser");
const { areTransactionsDuplicate } = require("../src/utils/deduplication");
const { buildSafetySummary } = require("../src/utils/financialSafety");

test("parseTransactionText extracts amount, category and expense type", () => {
  const parsed = parseTransactionText("Spent 200 on food at Swiggy");

  assert.equal(parsed.amount, 200);
  assert.equal(parsed.category, "food");
  assert.equal(parsed.type, "expense");
  assert.equal(parsed.vendor, "swiggy");
});

test("areTransactionsDuplicate matches nearby transactions with same amount and similar vendor", () => {
  const existing = {
    amount: 499,
    vendor: "Amazon Pay",
    category: "shopping",
    timestamp: "2026-04-22T10:00:00.000Z",
  };

  const incoming = {
    amount: 499,
    vendor: "amazonpay",
    category: "shopping",
    timestamp: "2026-04-22T10:03:00.000Z",
  };

  assert.equal(areTransactionsDuplicate(existing, incoming), true);
});

test("buildSafetySummary returns warning and critical states correctly", () => {
  const warning = buildSafetySummary({ income: 1000, expense: 950 });
  const critical = buildSafetySummary({ income: 1000, expense: 1001 });

  assert.equal(warning.status, "warning");
  assert.match(warning.message, /nearing/i);
  assert.equal(critical.status, "critical");
});
