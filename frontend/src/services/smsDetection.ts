import { NativeModules, PermissionsAndroid, Platform } from "react-native";

import { ParseResult } from "../types";

type NativeSmsMessage = {
  id?: string;
  sender?: string;
  body?: string;
  timestamp?: string | number;
};

type SmsScanResult =
  | { available: true; suggestions: ParseResult[] }
  | { available: false; reason: string; suggestions: ParseResult[] };

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
  "emi"
];

const creditWords = ["credited", "credit", "received", "deposited", "refund", "cashback", "salary"];
const ignoredWords = ["otp", "one time password", "verification code", "login", "password"];
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
  "rtgs"
];

const categoryRules: Record<string, string[]> = {
  food: ["swiggy", "zomato", "restaurant", "cafe", "dining"],
  groceries: ["blinkit", "zepto", "bigbasket", "grocery", "dmart"],
  transport: ["uber", "ola", "rapido", "fuel", "petrol", "metro"],
  shopping: ["amazon", "flipkart", "myntra", "shopping"],
  entertainment: ["netflix", "spotify", "prime", "hotstar", "bookmyshow"],
  bills: ["autopay", "mandate", "emi", "electricity", "recharge", "bill"]
};

type BankDetails = NonNullable<ParseResult["bankDetails"]>;

const amountPattern = "(?:rs\\.?|inr)?\\s*([\\d,]+(?:\\.\\d{1,2})?)";

const bankTemplates: Array<{
  bankName: string;
  transactionType: "DEBIT" | "CREDIT";
  pattern: RegExp;
  fields: { account: number; amount: number; party: number; ref?: number; balance?: number };
}> = [
  {
    bankName: "State Bank of India",
    transactionType: "DEBIT",
    pattern: new RegExp(
      `^SBI UPI - Dear UPI user A\\/C X(\\d{4}) debited by ${amountPattern} on date ([0-9]{2}[A-Z]{3}[0-9]{2}) trf to (.+?) Refno ([0-9]{12})\\. If not u\\? call 1800111109\\. - SBI$`,
      "i"
    ),
    fields: { account: 1, amount: 2, party: 4, ref: 5 }
  },
  {
    bankName: "State Bank of India",
    transactionType: "CREDIT",
    pattern: new RegExp(
      `^Dear SBI User, A\\/C X(\\d{4}) Credited by ${amountPattern} on (.+?) via UPI Ref No ([0-9]{12}) by (.+?)\\. - SBI$`,
      "i"
    ),
    fields: { account: 1, amount: 2, ref: 4, party: 5 }
  },
  {
    bankName: "Punjab National Bank",
    transactionType: "DEBIT",
    pattern:
      /^Dear Customer, A\/C X(\d{4}) debited for INR\s*([\d,]+(?:\.\d{1,2})?) via UPI to (.+?) on ([0-9]{2}-[0-9]{2}-[0-9]{2})\. Clear Bal: INR\s*([\d,]+(?:\.\d{1,2})?)\. Download PNB One App\.?$/i,
    fields: { account: 1, amount: 2, party: 3, balance: 5 }
  },
  {
    bankName: "Punjab National Bank",
    transactionType: "CREDIT",
    pattern:
      /^Dear Customer, A\/C X(\d{4}) credited for INR\s*([\d,]+(?:\.\d{1,2})?) via UPI from (.+?) on ([0-9]{2}-[0-9]{2}-[0-9]{2})\. Clear Bal: INR\s*([\d,]+(?:\.\d{1,2})?)\. - PNB$/i,
    fields: { account: 1, amount: 2, party: 3, balance: 5 }
  },
  {
    bankName: "Bank of Baroda",
    transactionType: "DEBIT",
    pattern:
      /^Alert: Your A\/C (\d{4}) debited for Rs\.?\s*([\d,]+(?:\.\d{1,2})?) via UPI on (.+?) (.+?) to (.+?)\. Ref No ([0-9]{12})\. Bal: Rs\.?\s*([\d,]+(?:\.\d{1,2})?) - bob World$/i,
    fields: { account: 1, amount: 2, party: 5, ref: 6, balance: 7 }
  },
  {
    bankName: "Bank of Baroda",
    transactionType: "CREDIT",
    pattern:
      /^Alert: Your A\/C (\d{4}) credited for Rs\.?\s*([\d,]+(?:\.\d{1,2})?) via UPI on (.+?) (.+?) by (.+?)\. Ref No ([0-9]{12})\. Bal: Rs\.?\s*([\d,]+(?:\.\d{1,2})?) - bob World$/i,
    fields: { account: 1, amount: 2, party: 5, ref: 6, balance: 7 }
  },
  {
    bankName: "HDFC Bank",
    transactionType: "DEBIT",
    pattern:
      /^Used Rs\.?\s*([\d,]+(?:\.\d{1,2})?) On HDFCBank Card\/Ac (\d{4}) At (.+?) by UPI ([0-9]{12}) On ([0-9]{2}-[0-9]{2})\. Not You\? Call 18002586161\/SMS BLOCK UPI to 7308080808\.?$/i,
    fields: { amount: 1, account: 2, party: 3, ref: 4 }
  },
  {
    bankName: "HDFC Bank",
    transactionType: "CREDIT",
    pattern:
      /^Amt Received Rs\.?\s*([\d,]+(?:\.\d{1,2})?) In HDFC Bank A\/C (\d{4}) From (.+?) On ([0-9]{2}-[0-9]{2}) Ref ([0-9]{12})\.?$/i,
    fields: { amount: 1, account: 2, party: 3, ref: 5 }
  },
  {
    bankName: "ICICI Bank",
    transactionType: "DEBIT",
    pattern:
      /^ICICI Bank Acct (\d{4}) debited for INR\s*([\d,]+(?:\.\d{1,2})?) on ([0-9]{2}-[A-Z]{3}-[0-9]{2}) ([0-9]{2}:[0-9]{2})\. UPI Ref ([0-9]{12}) to (.+?)\. Avail Bal: INR\s*([\d,]+(?:\.\d{1,2})?)\. If not you, call 18001080\.?$/i,
    fields: { account: 1, amount: 2, ref: 5, party: 6, balance: 7 }
  },
  {
    bankName: "ICICI Bank",
    transactionType: "CREDIT",
    pattern:
      /^ICICI Bank Acct (\d{4}) credited with INR\s*([\d,]+(?:\.\d{1,2})?) on ([0-9]{2}-[A-Z]{3}-[0-9]{2})\. UPI Ref ([0-9]{12}) by (.+?)\. Avail Bal: INR\s*([\d,]+(?:\.\d{1,2})?)\.?$/i,
    fields: { account: 1, amount: 2, ref: 4, party: 5, balance: 6 }
  },
  {
    bankName: "Axis Bank",
    transactionType: "DEBIT",
    pattern:
      /^Axis Bank A\/C XXXXXX(\d{4}) debited for INR\s*([\d,]+(?:\.\d{1,2})?) on ([0-9]{2}-[0-9]{2}-[0-9]{2}) via UPI to (.+?) \(Ref ([0-9]{12})\)\. Not you\? SMS BLOCKUPI to 56161600\.?$/i,
    fields: { account: 1, amount: 2, party: 4, ref: 5 }
  },
  {
    bankName: "Axis Bank",
    transactionType: "CREDIT",
    pattern:
      /^Axis Bank A\/C XXXXXX(\d{4}) credited with INR\s*([\d,]+(?:\.\d{1,2})?) on ([0-9]{2}-[0-9]{2}-[0-9]{2}) via UPI (?:from|by) (.+?) \(Ref ([0-9]{12})\)\.?$/i,
    fields: { account: 1, amount: 2, party: 4, ref: 5 }
  }
];

export async function scanSmsForTransactions(): Promise<SmsScanResult> {
  if (Platform.OS !== "android") {
    return { available: false, reason: "SMS scanning is available on Android only.", suggestions: [] };
  }

  const granted = await requestSmsPermissions();
  if (!granted) {
    return { available: false, reason: "SMS permission was not granted.", suggestions: [] };
  }

  const smsReader = NativeModules.SpenzaSmsReader as
    | { getRecentSms?: (options: { sinceHours: number; limit: number }) => Promise<NativeSmsMessage[]> }
    | undefined;

  if (!smsReader?.getRecentSms) {
    return {
      available: false,
      reason: "Android SMS reader module is not installed in this build.",
      suggestions: []
    };
  }

  const messages = await smsReader.getRecentSms({ sinceHours: 24, limit: 200 });
  return {
    available: true,
    suggestions: messages.map(parseSmsMessage).filter(Boolean) as ParseResult[]
  };
}

async function requestSmsPermissions() {
  const results = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.READ_SMS,
    PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
  ]);

  return (
    results[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED &&
    results[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED
  );
}

export function parseSmsMessage(message: NativeSmsMessage): ParseResult | null {
  const body = normalizeText(message.body);
  const lower = body.toLowerCase();
  if (!body || ignoredWords.some((word) => lower.includes(word))) return null;

  const bankDetails = parseBankTemplate(body);
  if (bankDetails) {
    const timestamp = normalizeTimestamp(message.timestamp);
    const type = bankDetails.transaction_type === "CREDIT" ? "income" : "expense";
    return {
      amount: bankDetails.amount,
      type,
      category: detectCategory(lower, type),
      vendor: bankDetails.payee_or_sender_vpa,
      confidence: 0.98,
      originalText: body,
      timestamp,
      paymentMethod: "UPI",
      source: "sms",
      sourceReferenceHash: localHash(`${message.sender ?? ""}|${bankDetails.upi_ref_no || body}|${timestamp}`),
      bankDetails
    };
  }

  if (!financialWords.some((word) => lower.includes(word))) return null;

  const amount = detectAmount(body);
  if (!amount) return null;

  const type = creditWords.some((word) => lower.includes(word)) ? "income" : "expense";
  const category = detectCategory(lower, type);
  const vendor = detectVendor(body);
  const reference = detectReference(body);
  const confidence = buildConfidence({ amount, category, lower, reference, vendor });

  if (confidence < 0.55) return null;

  const timestamp = normalizeTimestamp(message.timestamp);
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
    sourceReferenceHash: localHash(`${message.sender ?? ""}|${reference || body}|${timestamp}`)
  };
}

function parseBankTemplate(body: string): BankDetails | null {
  for (const template of bankTemplates) {
    const match = body.match(template.pattern);
    if (!match) continue;

    return {
      bank_name: template.bankName,
      transaction_type: template.transactionType,
      amount: Number(match[template.fields.amount].replace(/,/g, "")),
      account_last_4_digits: match[template.fields.account],
      payee_or_sender_vpa: match[template.fields.party].trim().replace(/\s+/g, " "),
      upi_ref_no: template.fields.ref ? match[template.fields.ref] : null,
      available_balance: template.fields.balance ? match[template.fields.balance].replace(/,/g, "") : null
    };
  }

  return null;
}

function normalizeText(input = "") {
  return String(input).trim().replace(/\s+/g, " ");
}

function normalizeTimestamp(input?: string | number) {
  if (typeof input === "number") return new Date(input).toISOString();
  if (typeof input === "string" && input) return new Date(input).toISOString();
  return new Date().toISOString();
}

function detectAmount(text: string) {
  const match = text.match(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i);
  return match?.[1] ? Number(match[1].replace(/,/g, "")) : null;
}

function detectCategory(lower: string, type: string) {
  if (type === "income") {
    if (lower.includes("salary")) return "salary";
    if (lower.includes("refund") || lower.includes("cashback")) return "refund";
    return "income";
  }

  for (const [category, keywords] of Object.entries(categoryRules)) {
    if (keywords.some((keyword) => lower.includes(keyword))) return category;
  }
  return "other";
}

function detectVendor(text: string) {
  const match = text.match(
    /\b(?:at|to|towards|for|from|merchant|payee)\s*[:\-]?\s+([a-z0-9][a-z0-9&@.\- ]{1,40}?)(?:\s+(?:on|via|using|ref|utr|txn|from|rs|inr|₹)|[.]|$)/i
  );
  return match?.[1]?.trim().replace(/\s+/g, " ") ?? "";
}

function detectReference(text: string) {
  const match = text.match(/\b(?:utr|ref(?:erence)?|txn(?:id)?|rrn)\s*(?:no\.?|id|:|-)?\s*([a-z0-9]{6,})/i);
  return match?.[1] ?? "";
}

function detectPaymentMethod(lower: string) {
  if (lower.includes("upi") || lower.includes("vpa") || lower.includes("utr")) return "UPI";
  if (lower.includes("card") || lower.includes("pos")) return "Card";
  if (lower.includes("atm")) return "ATM";
  if (lower.includes("autopay") || lower.includes("mandate") || lower.includes("emi")) return "Auto debit";
  return "Bank";
}

function buildConfidence({
  amount,
  category,
  lower,
  reference,
  vendor
}: {
  amount: number;
  category: string;
  lower: string;
  reference: string;
  vendor: string;
}) {
  let confidence = 0.15;
  if (amount) confidence += 0.35;
  if (financialWords.some((word) => lower.includes(word))) confidence += 0.25;
  if (vendor) confidence += 0.1;
  if (category !== "other") confidence += 0.08;
  if (reference) confidence += 0.07;
  return Math.min(Number(confidence.toFixed(2)), 0.98);
}

function localHash(value: string) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return `sms-${(hash >>> 0).toString(16)}`;
}
