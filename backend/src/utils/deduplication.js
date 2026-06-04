function normalizeVendor(vendor = "") {
  return vendor.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function vendorSimilarity(first, second) {
  const a = normalizeVendor(first);
  const b = normalizeVendor(second);

  if (!a && !b) {
    return 1;
  }

  if (!a || !b) {
    return 0;
  }

  if (a === b || a.includes(b) || b.includes(a)) {
    return 1;
  }

  const aTokens = new Set(a.match(/[a-z]+|\d+/g) || []);
  const bTokens = new Set(b.match(/[a-z]+|\d+/g) || []);
  const overlap = [...aTokens].filter((token) => bTokens.has(token)).length;
  const total = new Set([...aTokens, ...bTokens]).size || 1;

  return overlap / total;
}

function minutesBetween(left, right) {
  const first = new Date(left).getTime();
  const second = new Date(right).getTime();
  return Math.abs(first - second) / (1000 * 60);
}

function areTransactionsDuplicate(existing, incoming) {
  const sameAmount = Number(existing.amount) === Number(incoming.amount);
  const withinWindow = minutesBetween(existing.timestamp, incoming.timestamp) <= 5;
  const similarVendor = vendorSimilarity(existing.vendor, incoming.vendor) >= 0.6;
  const sameCategory = existing.category === incoming.category;

  return sameAmount && withinWindow && (similarVendor || sameCategory);
}

function findDuplicate(existingTransactions, incoming) {
  return existingTransactions.find((candidate) => areTransactionsDuplicate(candidate, incoming)) || null;
}

module.exports = {
  areTransactionsDuplicate,
  findDuplicate,
  vendorSimilarity,
};

