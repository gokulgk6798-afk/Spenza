export type AppUser = {
  id: string;
  email: string;
  displayName: string;
  token: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  preferences?: UserPreferences;
};

export type UserPreferences = {
  currency: string;
  theme: "dark" | "light" | "system";
  accentColor: string;
  fontSize: "Small" | "Medium" | "Large";
};

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  preferences: UserPreferences;
  linkedAccounts: LinkedAccount[];
  paymentMethods: PaymentMethod[];
};

export type LinkedAccount = {
  id: string;
  accountType: "bank" | "upi";
  name: string;
  detail: string;
  status: "active" | "inactive";
};

export type PaymentMethod = {
  id: string;
  methodType: "card";
  name: string;
  detail: string;
};

export type BudgetItem = {
  id: string;
  category: string;
  icon: string;
  name: string;
  spent: number;
  limit: number;
  color: string;
};

export type TransactionRecord = {
  id: string;
  amount: number;
  type: string;
  category: string;
  vendor: string;
  timestamp: string;
  source: string;
  mergeCount: number;
};

export type ParseResult = {
  amount: number;
  type: string;
  category: string;
  vendor: string;
  confidence: number;
  originalText: string;
  timestamp?: string;
  paymentMethod?: string;
};

export type SafetySummary = {
  status: string;
  message: string;
  expenseRatio: number;
  savings: number;
};

export type DashboardSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  safety: SafetySummary;
  insights: string[];
  recentTransactions: TransactionRecord[];
};

export type CategoryInsight = {
  category: string;
  amount: number;
  percentage: number;
};

export type InsightsData = {
  categoryBreakdown: CategoryInsight[];
  weeklyComparison: {
    currentWeekExpense: number;
    previousWeekExpense: number;
    percentageChange: number;
  };
  alerts: string[];
};

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};
