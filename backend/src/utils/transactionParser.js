const categoryKeywords = require("./categoryKeywords");

const incomeKeywords = ["salary", "credited", "received", "income", "earned", "refund", "bonus"];
const expenseKeywords = ["spent", "paid", "bought", "debited", "recharge", "ordered"];

function normalizeText(input = "") {
  return input.trim().replace(/\s+/g, " ");
}

function detectAmount(text) {
  const amountMatch = text.match(/(?:rs\.?|inr|usd|\$|₹)?\s*(\d+(?:\.\d{1,2})?)/i);
  return amountMatch ? Number(amountMatch[1]) : null;
}

function detectType(text) {
  const lower = text.toLowerCase();
  if (incomeKeywords.some((keyword) => lower.includes(keyword))) {
    return "income";
  }

  if (expenseKeywords.some((keyword) => lower.includes(keyword))) {
    return "expense";
  }

  return "expense";
}

function detectCategory(text) {
  const lower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return category;
    }
  }

  return "other";
}

function detectVendor(text, category) {
  const lower = text.toLowerCase();
  const explicitVendorMatch = lower.match(/\b(?:at|from|to)\s+([a-z][a-z0-9&.\- ]{1,30})/i);

  if (explicitVendorMatch) {
    return explicitVendorMatch[1].trim();
  }

  const stopWords = new Set([
    ...Object.keys(categoryKeywords),
    ...incomeKeywords,
    ...expenseKeywords,
    "rs",
    "inr",
    "for",
    "via",
    "on",
    "using",
    "spent",
    "paid",
    "received",
  ]);

  const tokens = lower
    .replace(/[₹$]/g, "")
    .split(/\s+/)
    .filter((token) => token && !/^\d+(\.\d{1,2})?$/.test(token) && !stopWords.has(token));

  const vendorToken = tokens.find((token) => token !== category);
  return vendorToken || "";
}

function buildConfidence({ amount, category, vendor, originalText }) {
  let confidence = 0.35;

  if (amount) {
    confidence += 0.35;
  }

  if (category && category !== "other") {
    confidence += 0.2;
  }

  if (vendor) {
    confidence += 0.1;
  }

  if (originalText.split(" ").length >= 3) {
    confidence += 0.05;
  }

  return Math.min(Number(confidence.toFixed(2)), 0.98);
}

function parseTransactionText(input = "") {
  const originalText = normalizeText(input);
  const amount = detectAmount(originalText);
  const type = detectType(originalText);
  const category = detectCategory(originalText);
  const vendor = detectVendor(originalText, category);

  return {
    originalText,
    amount,
    type,
    category,
    vendor,
    confidence: buildConfidence({ amount, category, vendor, originalText }),
  };
}

module.exports = {
  parseTransactionText,
};

