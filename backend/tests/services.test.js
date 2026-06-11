const test = require("node:test");
const assert = require("node:assert/strict");
const { parseTransactionText } = require("../src/utils/transactionParser");
const { parseSmsTransaction } = require("../src/utils/smsTransactionParser");
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

test("parseSmsTransaction extracts a UPI debit suggestion", () => {
  const parsed = parseSmsTransaction({
    sender: "HDFCBK",
    timestamp: "2026-06-11T09:30:00.000Z",
    body: "Rs.450.00 debited from A/C XX4521 via UPI to SWIGGY on 11-06-26. UTR 612345678901.",
  });

  assert.ok(parsed);
  assert.equal(parsed.amount, 450);
  assert.equal(parsed.type, "expense");
  assert.equal(parsed.paymentMethod, "UPI");
  assert.equal(parsed.source, "sms");
  assert.equal(parsed.sourceReference, "612345678901");
  assert.ok(parsed.sourceReferenceHash);
});

test("parseSmsTransaction rejects OTP messages", () => {
  const parsed = parseSmsTransaction({
    sender: "BANK",
    body: "OTP 123456 for login. Do not share this password with anyone.",
  });

  assert.equal(parsed, null);
});

test("parseSmsTransaction matches strict bank templates", () => {
  const samples = [
    {
      body: "SBI UPI - Dear UPI user A/C X1234 debited by 450.00 on date 11JUN26 trf to zomato@upi Refno 612345678901. If not u? call 1800111109. - SBI",
      bank: "State Bank of India",
      type: "DEBIT",
      account: "1234",
      party: "zomato@upi",
      ref: "612345678901",
      balance: null,
    },
    {
      body: "Dear Customer, A/C X2345 credited for INR 1,250.50 via UPI from john@upi on 11-06-26. Clear Bal: INR 25,000.75. - PNB",
      bank: "Punjab National Bank",
      type: "CREDIT",
      account: "2345",
      party: "john@upi",
      ref: null,
      balance: "25000.75",
    },
    {
      body: "Alert: Your A/C 3456 debited for Rs.500.00 via UPI on 11-06-26 10:30 to merchant@upi. Ref No 712345678901. Bal: Rs.20,000.00 - bob World",
      bank: "Bank of Baroda",
      type: "DEBIT",
      account: "3456",
      party: "merchant@upi",
      ref: "712345678901",
      balance: "20000.00",
    },
    {
      body: "Amt Received Rs.999.00 In HDFC Bank A/C 4567 From payer@upi On 11-06 Ref 812345678901.",
      bank: "HDFC Bank",
      type: "CREDIT",
      account: "4567",
      party: "payer@upi",
      ref: "812345678901",
      balance: null,
    },
    {
      body: "ICICI Bank Acct 5678 debited for INR 300.00 on 11-JUN-26 09:45. UPI Ref 912345678901 to shop@upi. Avail Bal: INR 10,500.00. If not you, call 18001080.",
      bank: "ICICI Bank",
      type: "DEBIT",
      account: "5678",
      party: "shop@upi",
      ref: "912345678901",
      balance: "10500.00",
    },
    {
      body: "Axis Bank A/C XXXXXX6789 credited with INR 700.00 on 11-06-26 via UPI from friend@upi (Ref 112345678901).",
      bank: "Axis Bank",
      type: "CREDIT",
      account: "6789",
      party: "friend@upi",
      ref: "112345678901",
      balance: null,
    },
  ];

  for (const sample of samples) {
    const parsed = parseSmsTransaction({ body: sample.body, timestamp: "2026-06-11T10:00:00.000Z" });

    assert.ok(parsed, sample.bank);
    assert.equal(parsed.bankDetails.bank_name, sample.bank);
    assert.equal(parsed.bankDetails.transaction_type, sample.type);
    assert.equal(parsed.bankDetails.account_last_4_digits, sample.account);
    assert.equal(parsed.bankDetails.payee_or_sender_vpa, sample.party);
    assert.equal(parsed.bankDetails.upi_ref_no, sample.ref);
    assert.equal(parsed.bankDetails.available_balance, sample.balance);
    assert.equal(parsed.confidence, 0.98);
  }
});
