import {
  AppUser,
  BudgetItem,
  DashboardSummary,
  InsightsData,
  LinkedAccount,
  ParseResult,
  PaymentMethod,
  TransactionRecord,
  UserPreferences,
  UserProfile
} from "../types";

const fallbackBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const response = await fetch(`${fallbackBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data.message === "string" ? data.message : "Request failed";
    throw new Error(message);
  }
  return data as T;
}

function normalizeTransaction(item: Record<string, unknown>): TransactionRecord {
  return {
    id: String(item._id ?? item.id ?? ""),
    amount: Number(item.amount ?? 0),
    type: String(item.type ?? "expense"),
    category: String(item.category ?? "other"),
    vendor: String(item.vendor ?? ""),
    timestamp: String(item.timestamp ?? new Date().toISOString()),
    source: String(item.source ?? "chat"),
    mergeCount: Number(item.mergeCount ?? 1)
  };
}

export async function login(
  email: string,
  password?: string,
  provider = "email",
  displayName?: string
): Promise<AppUser> {
  const data = await request<{ user: Omit<AppUser, "token">; token: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        provider,
        displayName
      })
    }
  );

  return {
    id: data.user.id,
    email: data.user.email,
    displayName: data.user.displayName ?? "",
    token: data.token
  };
}

export async function fetchDashboard(token: string): Promise<DashboardSummary> {
  const data = await request<DashboardSummary>("/dashboard", {}, token);
  return {
    totalIncome: Number(data.totalIncome ?? 0),
    totalExpense: Number(data.totalExpense ?? 0),
    balance: Number(data.balance ?? 0),
    safety: {
      status: data.safety?.status ?? "healthy",
      message: data.safety?.message ?? "",
      expenseRatio: Number(data.safety?.expenseRatio ?? 0),
      savings: Number(data.safety?.savings ?? 0)
    },
    insights: data.insights ?? [],
    recentTransactions: (data.recentTransactions ?? []).map((item) =>
      normalizeTransaction(item as unknown as Record<string, unknown>)
    )
  };
}

export async function fetchTransactions(
  token: string,
  category = "all"
): Promise<TransactionRecord[]> {
  const query = category === "all" ? "" : `?category=${category}`;
  const data = await request<{ transactions: Record<string, unknown>[] }>(
    `/transactions${query}`,
    {},
    token
  );
  return (data.transactions ?? []).map(normalizeTransaction);
}

export async function parseTransaction(
  token: string,
  text: string
): Promise<ParseResult> {
  return request<ParseResult>(
    "/transactions/parse",
    {
      method: "POST",
      body: JSON.stringify({ text })
    },
    token
  );
}

export async function createTransaction(
  token: string,
  parsed: ParseResult
): Promise<TransactionRecord> {
  const data = await request<{ transaction: Record<string, unknown> }>(
    "/transactions",
    {
      method: "POST",
      body: JSON.stringify({
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        vendor: parsed.vendor,
        timestamp: parsed.timestamp,
        rawText: parsed.originalText,
        source: "chat"
      })
    },
    token
  );
  return normalizeTransaction(data.transaction);
}

export async function fetchInsights(token: string): Promise<InsightsData> {
  return request<InsightsData>("/insights", {}, token);
}

function normalizePreferences(item: Partial<UserPreferences> | undefined): UserPreferences {
  return {
    currency: item?.currency ?? "INR",
    theme: item?.theme ?? "dark",
    accentColor: item?.accentColor ?? "#FF5533",
    fontSize: item?.fontSize ?? "Medium"
  };
}

function normalizeProfile(item: Partial<UserProfile>): UserProfile {
  return {
    id: String(item.id ?? ""),
    email: String(item.email ?? ""),
    displayName: String(item.displayName ?? ""),
    phone: String(item.phone ?? ""),
    dateOfBirth: String(item.dateOfBirth ?? ""),
    gender: String(item.gender ?? ""),
    preferences: normalizePreferences(item.preferences),
    linkedAccounts: (item.linkedAccounts ?? []).map(normalizeLinkedAccount),
    paymentMethods: (item.paymentMethods ?? []).map(normalizePaymentMethod)
  };
}

function normalizeLinkedAccount(item: Partial<LinkedAccount>): LinkedAccount {
  return {
    id: String(item.id ?? ""),
    accountType: item.accountType === "upi" ? "upi" : "bank",
    name: String(item.name ?? ""),
    detail: String(item.detail ?? ""),
    status: item.status === "inactive" ? "inactive" : "active"
  };
}

function normalizePaymentMethod(item: Partial<PaymentMethod>): PaymentMethod {
  return {
    id: String(item.id ?? ""),
    methodType: "card",
    name: String(item.name ?? ""),
    detail: String(item.detail ?? "")
  };
}

function normalizeBudget(item: Partial<BudgetItem>): BudgetItem {
  return {
    id: String(item.id ?? ""),
    category: String(item.category ?? item.name ?? "other"),
    icon: String(item.icon ?? "sparkles-outline"),
    name: String(item.name ?? "Budget"),
    spent: Number(item.spent ?? 0),
    limit: Number(item.limit ?? 0),
    color: String(item.color ?? "#FF5533")
  };
}

export async function fetchProfile(token: string): Promise<UserProfile> {
  const data = await request<{ profile: Partial<UserProfile> }>("/profile", {}, token);
  return normalizeProfile(data.profile ?? {});
}

export async function updateProfile(
  token: string,
  payload: {
    displayName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
  }
): Promise<UserProfile> {
  const data = await request<{ profile: Partial<UserProfile> }>(
    "/profile",
    {
      method: "PATCH",
      body: JSON.stringify(payload)
    },
    token
  );
  return normalizeProfile(data.profile ?? {});
}

export async function updatePreferences(
  token: string,
  payload: Partial<UserPreferences>
): Promise<UserPreferences> {
  const data = await request<{ preferences: Partial<UserPreferences> }>(
    "/profile/preferences",
    {
      method: "PATCH",
      body: JSON.stringify(payload)
    },
    token
  );
  return normalizePreferences(data.preferences);
}

export async function fetchLinkedAccounts(
  token: string
): Promise<{ linkedAccounts: LinkedAccount[]; paymentMethods: PaymentMethod[] }> {
  const data = await request<{
    linkedAccounts: Partial<LinkedAccount>[];
    paymentMethods: Partial<PaymentMethod>[];
  }>("/profile/linked-accounts", {}, token);
  return {
    linkedAccounts: (data.linkedAccounts ?? []).map(normalizeLinkedAccount),
    paymentMethods: (data.paymentMethods ?? []).map(normalizePaymentMethod)
  };
}

export async function addLinkedAccount(
  token: string,
  payload: { accountType: "bank" | "upi"; name: string; detail: string }
) {
  const data = await request<{
    linkedAccounts: Partial<LinkedAccount>[];
    paymentMethods: Partial<PaymentMethod>[];
  }>(
    "/profile/linked-accounts",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    token
  );
  return {
    linkedAccounts: (data.linkedAccounts ?? []).map(normalizeLinkedAccount),
    paymentMethods: (data.paymentMethods ?? []).map(normalizePaymentMethod)
  };
}

export async function removeLinkedAccount(token: string, accountId: string) {
  const data = await request<{
    linkedAccounts: Partial<LinkedAccount>[];
    paymentMethods: Partial<PaymentMethod>[];
  }>(
    `/profile/linked-accounts/${accountId}`,
    {
      method: "DELETE"
    },
    token
  );
  return {
    linkedAccounts: (data.linkedAccounts ?? []).map(normalizeLinkedAccount),
    paymentMethods: (data.paymentMethods ?? []).map(normalizePaymentMethod)
  };
}

export async function addPaymentMethod(
  token: string,
  payload: { name: string; detail: string }
) {
  const data = await request<{
    linkedAccounts: Partial<LinkedAccount>[];
    paymentMethods: Partial<PaymentMethod>[];
  }>(
    "/profile/payment-methods",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    token
  );
  return {
    linkedAccounts: (data.linkedAccounts ?? []).map(normalizeLinkedAccount),
    paymentMethods: (data.paymentMethods ?? []).map(normalizePaymentMethod)
  };
}

export async function fetchBudgets(token: string): Promise<BudgetItem[]> {
  const data = await request<{ budgets: Partial<BudgetItem>[] }>("/budgets", {}, token);
  return (data.budgets ?? []).map(normalizeBudget);
}

export async function createBudget(
  token: string,
  payload: Pick<BudgetItem, "name" | "category" | "limit" | "icon" | "color">
): Promise<BudgetItem[]> {
  const data = await request<{ budgets: Partial<BudgetItem>[] }>(
    "/budgets",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    token
  );
  return (data.budgets ?? []).map(normalizeBudget);
}

export async function updateBudget(
  token: string,
  budgetId: string,
  payload: Partial<Pick<BudgetItem, "name" | "category" | "limit" | "icon" | "color">>
): Promise<BudgetItem[]> {
  const data = await request<{ budgets: Partial<BudgetItem>[] }>(
    `/budgets/${budgetId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload)
    },
    token
  );
  return (data.budgets ?? []).map(normalizeBudget);
}
