const crypto = require("crypto");
const categoryKeywords = require("./categoryKeywords");

const debitWords = [
  "debited",
  "debit",
  "spent",
  "paid",
  "withdrawn",
  "purchase",
  "sent",
  "autopay",
  "mandate",
  "emi",
];

const creditWords = [
  "credited",
  "credit",
  "received",
  "deposited",
  "refund",
  "cashback",
  "salary",
];

const financialWords = [
  ...debitWords,
  ...creditWords,
  "upi",
  "utr",
  "ref",
  "card",
  "a/c",
  "account",
  "atm",
  "pos",
  "txn",
  "transaction",
  "imps",
  "neft",
  "rtgs",
];

const ignoredWords = ["otp", "one time password", "verification code", "login", "password"];
const amountPattern = "(?:rs\\.?|inr)?\\s*([\\d,]+(?:\\.\\d{1,2})?)";

const bankTemplates = [
  {
    bankName: "State Bank of India",
    transactionType: "DEBIT",
    pattern: new RegExp(
      `^SBI UPI - Dear UPI user A\\/C X(\\d{4}) debited by ${amountPattern} on date ([0-9]{2}[A-Z]{3}[0-9]{2}) trf to (.+?) Refno ([0-9]{12})\\. If not u\\? call 1800111109\\. - SBI$`,
      "i"
    ),
    fields: { account: 1, amount: 2, party: 4, ref: 5 },
  },
  {
    bankName: "State Bank of India",
    transactionType: "CREDIT",
    pattern: new RegExp(
      `^Dear SBI User, A\\/C X(\\d{4}) Credited by ${amountPattern} on (.+?) via UPI Ref No ([0-9]{12}) by (.+?)\\. - SBI$`,
      "i"
    ),
    fields: { account: 1, amount: 2, ref: 4, party: 5 },
  },
  {
    bankName: "Punjab National Bank",
    transactionType: "DEBIT",
    pattern: new RegExp(
      `^Dear Customer, A\\/C X(\\d{4}) debited for INR\\s*([\\d,]+(?:\\.\\d{1,2})?) via UPI to (.+?) on ([0-9]{2}-[0-9]{2}-[0-9]{2})\\. Clear Bal: INR\\s*([\\d,]+(?:\\.\\d{1,2})?)\\. Download PNB One App\\.?$`,
      "i"
    ),
    fields: { account: 1, amount: 2, party: 3, balance: 5 },
  },
  {
    bankName: "Punjab National Bank",
    transactionType: "CREDIT",
    pattern: new RegExp(
      `^Dear Customer, A\\/C X(\\d{4}) credited for INR\\s*([\\d,]+(?:\\.\\d{1,2})?) via UPI from (.+?) on ([0-9]{2}-[0-9]{2}-[0-9]{2})\\. Clear Bal: INR\\s*([\\d,]+(?:\\.\\d{1,2})?)\\. - PNB$`,
      "i"
    ),
    fields: { account: 1, amount: 2, party: 3, balance: 5 },
  },
  {
    bankName: "Bank of Baroda",
    transactionType: "DEBIT",
    pattern: new RegExp(
      `^Alert: Your A\\/C (\\d{4}) debited for Rs\\.?\\s*([\\d,]+(?:\\.\\d{1,2})?) via UPI on (.+?) (.+?) to (.+?)\\. Ref No ([0-9]{12})\\. Bal: Rs\\.?\\s*([\\d,]+(?:\\.\\d{1,2})?) - bob World$`,
      "i"
    ),
    fields: { account: 1, amount: 2, party: 5, ref: 6, balance: 7 },
  },
  {
    bankName: "Bank of Baroda",
    transactionType: "CREDIT",
    pattern: new RegExp(
      `^Alert: Your A\\/C (\\d{4}) credited for Rs\\.?\\s*([\\d,]+(?:\\.\\d{1,2})?) via UPI on (.+?) (.+?) by (.+?)\\. Ref No ([0-9]{12})\\. Bal: Rs\\.?\\s*([\\d,]+(?:\\.\\d{1,2})?) - bob World$`,
      "i"
    ),
    fields: { account: 1, amount: 2, party: 5, ref: 6, balance: 7 },
  },
  {
    bankName: "HDFC Bank",
    transactionType: "DEBIT",
    pattern: new RegExp(
      `^Used Rs\\.?\\s*([\\d,]+(?:\\.\\d{1,2})?) On HDFCBank Card\\/Ac (\\d{4}) At (.+?) by UPI ([0-9]{12}) On ([0-9]{2}-[0-9]{2})\\. Not You\\? Call 18002586161\\/SMS BLOCK UPI to 7308080808\\.?$`,
      "i"
    ),
    fields: { amount: 1, account: 2, party: 3, ref: 4 },
  },
  {
    bankName: "HDFC Bank",
    transactionType: "CREDIT",
    pattern: new RegExp(
      `^Amt Received Rs\\.?\\s*([\\d,]+(?:\\.\\d{1,2})?) In HDFC Bank A\\/C (\\d{4}) From (.+?) On ([0-9]{2}-[0-9]{2}) Ref ([0-9]{12})\\.?$`,
      "i"
    ),
    fields: { amount: 1, account: 2, party: 3, ref: 5 },
  },
  {
    bankName: "ICICI Bank",
    transactionType: "DEBIT",
    pattern: new RegExp(
      `^ICICI Bank Acct (\\d{4}) debited for INR\\s*([\\d,]+(?:\\.\\d{1,2})?) on ([0-9]{2}-[A-Z]{3}-[0-9]{2}) ([0-9]{2}:[0-9]{2})\\. UPI Ref ([0-9]{12}) to (.+?)\\. Avail Bal: INR\\s*([\\d,]+(?:\\.\\d{1,2})?)\\. If not you, call 18001080\\.?$`,
      "i"
    ),
    fields: { account: 1, amount: 2, ref: 5, party: 6, balance: 7 },
  },
  {
    bankName: "ICICI Bank",
    transactionType: "CREDIT",
    pattern: new RegExp(
      `^ICICI Bank Acct (\\d{4}) credited with INR\\s*([\\d,]+(?:\\.\\d{1,2})?) on ([0-9]{2}-[A-Z]{3}-[0-9]{2})\\. UPI Ref ([0-9]{12}) by (.+?)\\. Avail Bal: INR\\s*([\\d,]+(?:\\.\\d{1,2})?)\\.?$`,
      "i"
    ),
    fields: { account: 1, amount: 2, ref: 4, party: 5, balance: 6 },
  },
  {
    bankName: "Axis Bank",
    transactionType: "DEBIT",
    pattern: new RegExp(
      `^Axis Bank A\\/C XXXXXX(\\d{4}) debited for INR\\s*([\\d,]+(?:\\.\\d{1,2})?) on ([0-9]{2}-[0-9]{2}-[0-9]{2}) via UPI to (.+?) \\(Ref ([0-9]{12})\\)\\. Not you\\? SMS BLOCKUPI to 56161600\\.?$`,
      "i"
    ),
    fields: { account: 1, amount: 2, party: 4, ref: 5 },
  },
  {
    bankName: "Axis Bank",
    transactionType: "CREDIT",
    pattern: new RegExp(
      `^Axis Bank A\\/C XXXXXX(\\d{4}) credited with INR\\s*([\\d,]+(?:\\.\\d{1,2})?) on ([0-9]{2}-[0-9]{2}-[0-9]{2}) via UPI (?:from|by) (.+?) \\(Ref ([0-9]{12})\\)\\.?$`,
      "i"
    ),
    fields: { account: 1, amount: 2, party: 4, ref: 5 },
  },
];

function normalizeText(input = "") {
  return String(input).trim().replace(/\s+/g, " ");
}

function hashSms({ body = "", sender = "", timestamp = "" }) {
  return crypto
    .createHash("sha256")
    .update(`${sender}|${timestamp}|${body}`)
    .digest("hex");
}

function cleanAmount(value = "") {
  return Number(String(value).replace(/,/g, ""));
}

function cleanParty(value = "") {
  return String(value).trim().replace(/\s+/g, " ");
}

function parseBankTemplate(body) {
  for (const template of bankTemplates) {
    const match = body.match(template.pattern);
    if (!match) continue;

    const bankDetails = {
      bank_name: template.bankName,
      transaction_type: template.transactionType,
      amount: cleanAmount(match[template.fields.amount]),
      account_last_4_digits: match[template.fields.account],
      payee_or_sender_vpa: cleanParty(match[template.fields.party]),
      upi_ref_no: template.fields.ref ? match[template.fields.ref] : null,
      available_balance: template.fields.balance ? String(match[template.fields.balance]).replace(/,/g, "") : null,
    };

    return bankDetails;
  }

  return null;
}

function detectAmount(text) {
  const matches = [...text.matchAll(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/gi)];
  const first = matches[0]?.[1];
  return first ? Number(first.replace(/,/g, "")) : null;
}

function detectType(lower) {
  if (creditWords.some((word) => lower.includes(word))) return "income";
  if (debitWords.some((word) => lower.includes(word))) return "expense";
  return "expense";
}

function detectPaymentMethod(lower) {
  if (lower.includes("upi") || lower.includes("vpa") || lower.includes("utr")) return "UPI";
  if (lower.includes("card") || lower.includes("pos")) return "Card";
  if (lower.includes("atm")) return "ATM";
  if (lower.includes("autopay") || lower.includes("mandate") || lower.includes("emi")) return "Auto debit";
  if (lower.includes("imps") || lower.includes("neft") || lower.includes("rtgs")) return "Bank transfer";
  return "Bank";
}

function detectCategory(lower, type) {
  if (type === "income") {
    if (lower.includes("salary")) return "salary";
    if (lower.includes("refund") || lower.includes("cashback")) return "refund";
    return "income";
  }

  if (lower.includes("autopay") || lower.includes("mandate") || lower.includes("emi")) {
    return "bills";
  }

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return category;
    }
  }

  return "other";
}

function detectVendor(text) {
  const patterns = [
    /\b(?:at|to|towards|for)\s+([a-z0-9][a-z0-9&@.\- ]{1,40}?)(?:\s+(?:on|via|using|ref|utr|txn|from|rs|inr|₹)|[.。]|$)/i,
    /\b(?:from)\s+([a-z0-9][a-z0-9&@.\- ]{1,40}?)(?:\s+(?:on|via|ref|utr|txn|rs|inr|₹)|[.。]|$)/i,
    /\b(?:merchant|payee)\s*[:\-]?\s*([a-z0-9][a-z0-9&@.\- ]{1,40}?)(?:\s+(?:on|via|ref|utr|txn)|[.。]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim().replace(/\s+/g, " ");
    }
  }

  return "";
}

function detectReference(text) {
  const match = text.match(/\b(?:utr|ref(?:erence)?|txn(?:id)?|rrn)\s*(?:no\.?|id|:|-)?\s*([a-z0-9]{6,})/i);
  return match?.[1] ?? "";
}

function buildConfidence({ lower, amount, vendor, category, referenceId }) {
  let confidence = 0.15;
  if (amount) confidence += 0.35;
  if (financialWords.some((word) => lower.includes(word))) confidence += 0.25;
  if (vendor) confidence += 0.1;
  if (category && category !== "other") confidence += 0.08;
  if (referenceId) confidence += 0.07;
  return Math.min(Number(confidence.toFixed(2)), 0.98);
}

function parseSmsTransaction(input = {}) {
  const body = normalizeText(input.body || input.text || "");
  const sender = normalizeText(input.sender || "");
  const timestamp = input.timestamp || new Date().toISOString();
  const lower = body.toLowerCase();

  if (!body || ignoredWords.some((word) => lower.includes(word))) {
    return null;
  }

  const templateDetails = parseBankTemplate(body);
  if (templateDetails) {
    const type = templateDetails.transaction_type === "CREDIT" ? "income" : "expense";
    return {
      amount: templateDetails.amount,
      type,
      category: detectCategory(lower, type),
      vendor: templateDetails.payee_or_sender_vpa,
      confidence: 0.98,
      originalText: body,
      timestamp,
      paymentMethod: "UPI",
      source: "sms",
      sourceReference: templateDetails.upi_ref_no || "",
      sourceReferenceHash: hashSms({ body: templateDetails.upi_ref_no || body, sender, timestamp }),
      bankDetails: templateDetails,
    };
  }

  if (!financialWords.some((word) => lower.includes(word))) {
    return null;
  }

  const amount = detectAmount(body);
  if (!amount) {
    return null;
  }

  const type = detectType(lower);
  const category = detectCategory(lower, type);
  const vendor = detectVendor(body);
  const referenceId = detectReference(body);
  const confidence = buildConfidence({ lower, amount, vendor, category, referenceId });

  if (confidence < 0.55) {
    return null;
  }

  return {
    amount,
    type,
    category,
    vendor,
    confidence,
    originalText: body,
    timestamp,
    paymentMethod: detectPaymentMethod(lower),
    source: "sms",
    sourceReference: referenceId,
    sourceReferenceHash: hashSms({ body: referenceId || body, sender, timestamp }),
  };
}

function parseSmsBatch(messages = []) {
  return messages.map(parseSmsTransaction).filter(Boolean);
}

module.exports = {
  parseSmsBatch,
  parseSmsTransaction,
};
