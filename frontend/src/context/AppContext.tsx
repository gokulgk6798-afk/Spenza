import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";

import * as api from "../api/client";
import { signInWithGoogle } from "../api/googleAuth";
import {
  AppUser,
  BudgetItem,
  ChatMessage,
  DashboardSummary,
  InsightsData,
  LinkedAccount,
  ParseResult,
  PaymentMethod,
  TransactionRecord,
  UserPreferences,
  UserProfile
} from "../types";

type AsyncState<T> = {
  data?: T;
  loading: boolean;
  error?: string;
};

type AppContextValue = {
  user?: AppUser;
  dashboard: AsyncState<DashboardSummary>;
  transactions: AsyncState<TransactionRecord[]>;
  insights: AsyncState<InsightsData>;
  profile: AsyncState<UserProfile>;
  budgets: AsyncState<BudgetItem[]>;
  linkedAccounts: AsyncState<{ linkedAccounts: LinkedAccount[]; paymentMethods: PaymentMethod[] }>;
  chatMessages: ChatMessage[];
  pendingParse?: ParseResult;
  isSending: boolean;
  isSaving: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  loadDashboard: () => Promise<void>;
  loadTransactions: (category?: string) => Promise<void>;
  loadInsights: () => Promise<void>;
  loadProfile: () => Promise<void>;
  saveProfile: (payload: {
    displayName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
  }) => Promise<void>;
  savePreferences: (payload: Partial<UserPreferences>) => Promise<void>;
  loadLinkedAccounts: () => Promise<void>;
  addLinkedAccount: (payload: { accountType: "bank" | "upi"; name: string; detail: string }) => Promise<void>;
  removeLinkedAccount: (accountId: string) => Promise<void>;
  addPaymentMethod: (payload: { name: string; detail: string }) => Promise<void>;
  loadBudgets: () => Promise<void>;
  addBudget: () => Promise<void>;
  saveBudgetLimit: (budgetId: string, limit: number) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  updatePendingParse: (nextParse: ParseResult) => void;
  confirmPending: () => Promise<void>;
};

const mockUser: AppUser = {
  id: "662f00000000000000000001",
  email: "mock@spenza.local",
  displayName: "Mock User",
  token: "mock-local-token"
};

const mockProfile: UserProfile = {
  id: mockUser.id,
  email: mockUser.email,
  displayName: mockUser.displayName,
  phone: "+91 98765 43210",
  dateOfBirth: "12 Mar 1995",
  gender: "Female",
  preferences: {
    currency: "INR",
    theme: "dark",
    accentColor: "#FF5533",
    fontSize: "Medium"
  },
  linkedAccounts: [
    {
      id: "mock-hdfc",
      accountType: "bank",
      name: "HDFC Bank",
      detail: "Savings ....4521",
      status: "active"
    },
    {
      id: "mock-paytm",
      accountType: "upi",
      name: "Paytm UPI",
      detail: "priya@paytm",
      status: "active"
    }
  ],
  paymentMethods: [
    {
      id: "mock-visa",
      methodType: "card",
      name: "Visa Card",
      detail: "Ending in 9876"
    }
  ]
};

const mockDashboard: DashboardSummary = {
  totalIncome: 85000,
  totalExpense: 24850,
  balance: 60150,
  safety: {
    status: "healthy",
    message: "You are within this month's safe spending range.",
    expenseRatio: 29,
    savings: 60150
  },
  insights: [
    "Food and groceries are your highest spend this week.",
    "You saved more than 70% of income this month.",
    "Recurring bills are stable compared with last month."
  ],
  recentTransactions: [
    {
      id: "mock-transaction-1",
      amount: 250,
      type: "expense",
      category: "groceries",
      vendor: "Blinkit",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      source: "chat",
      mergeCount: 1
    },
    {
      id: "mock-transaction-2",
      amount: 1200,
      type: "expense",
      category: "food",
      vendor: "Swiggy",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      source: "notification",
      mergeCount: 1
    }
  ]
};

const mockInsights: InsightsData = {
  categoryBreakdown: [
    { category: "Groceries", amount: 11200, percentage: 25 },
    { category: "Dining", amount: 8840, percentage: 18 },
    { category: "Transport", amount: 5380, percentage: 12 },
    { category: "Shopping", amount: 7400, percentage: 16 }
  ],
  weeklyComparison: {
    currentWeekExpense: 12400,
    previousWeekExpense: 11200,
    percentageChange: 10.7
  },
  alerts: ["Dining is pacing above your usual weekly average."]
};

const mockBudgets: BudgetItem[] = [
  { id: "food", category: "food", icon: "fast-food-outline", name: "Food", spent: 3200, limit: 5000, color: "#FF5533" },
  { id: "transport", category: "transport", icon: "car-outline", name: "Transport", spent: 2400, limit: 3000, color: "#F59E0B" },
  { id: "entertainment", category: "entertainment", icon: "film-outline", name: "Entertainment", spent: 1800, limit: 2000, color: "#FF5533" },
  { id: "groceries", category: "groceries", icon: "cart-outline", name: "Groceries", spent: 3100, limit: 5000, color: "#FF5533" },
  { id: "medical", category: "medical", icon: "medical-outline", name: "Medical", spent: 800, limit: 2000, color: "#FF5533" }
];

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AppUser>();
  const [dashboard, setDashboard] = useState<AsyncState<DashboardSummary>>({
    loading: false
  });
  const [transactions, setTransactions] = useState<
    AsyncState<TransactionRecord[]>
  >({ loading: false });
  const [insights, setInsights] = useState<AsyncState<InsightsData>>({
    loading: false
  });
  const [profile, setProfile] = useState<AsyncState<UserProfile>>({
    loading: false
  });
  const [budgets, setBudgets] = useState<AsyncState<BudgetItem[]>>({
    loading: false
  });
  const [linkedAccounts, setLinkedAccounts] = useState<
    AsyncState<{ linkedAccounts: LinkedAccount[]; paymentMethods: PaymentMethod[] }>
  >({ loading: false });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hey Rahul! What did you spend on?"
    }
  ]);
  const [pendingParse, setPendingParse] = useState<ParseResult>();
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const token = user?.token;

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    if (email.trim().toLowerCase() === "mock@spenza.local" && password === "Mock@1234") {
      setUser(mockUser);
      setDashboard({ data: mockDashboard, loading: false });
      setTransactions({ data: mockDashboard.recentTransactions, loading: false });
      setInsights({ data: mockInsights, loading: false });
      setProfile({ data: mockProfile, loading: false });
      setBudgets({ data: mockBudgets, loading: false });
      setLinkedAccounts({
        data: {
          linkedAccounts: mockProfile.linkedAccounts,
          paymentMethods: mockProfile.paymentMethods
        },
        loading: false
      });
      return;
    }

    const nextUser = await api.login(email.trim(), password);
    setUser(nextUser);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const profile = await signInWithGoogle();
    const nextUser = await api.login(
      profile.email,
      undefined,
      "google",
      profile.name
    );
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    setUser(undefined);
    setPendingParse(undefined);
    setProfile({ loading: false });
    setBudgets({ loading: false });
    setLinkedAccounts({ loading: false });
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    if (token === mockUser.token) {
      setDashboard({ data: mockDashboard, loading: false });
      return;
    }
    setDashboard((current) => ({ ...current, loading: true, error: undefined }));
    try {
      setDashboard({ data: await api.fetchDashboard(token), loading: false });
    } catch (error) {
      setDashboard({ loading: false, error: String(error) });
    }
  }, [token]);

  const loadTransactions = useCallback(
    async (category = "all") => {
      if (!token) return;
      if (token === mockUser.token) {
        const filtered =
          category === "all"
            ? mockDashboard.recentTransactions
            : mockDashboard.recentTransactions.filter(
                (item) => item.category.toLowerCase() === category
              );
        setTransactions({ data: filtered, loading: false });
        return;
      }
      setTransactions((current) => ({
        ...current,
        loading: true,
        error: undefined
      }));
      try {
        setTransactions({
          data: await api.fetchTransactions(token, category),
          loading: false
        });
      } catch (error) {
        setTransactions({ loading: false, error: String(error) });
      }
    },
    [token]
  );

  const loadInsights = useCallback(async () => {
    if (!token) return;
    if (token === mockUser.token) {
      setInsights({ data: mockInsights, loading: false });
      return;
    }
    setInsights((current) => ({ ...current, loading: true, error: undefined }));
    try {
      setInsights({ data: await api.fetchInsights(token), loading: false });
    } catch (error) {
      setInsights({ loading: false, error: String(error) });
    }
  }, [token]);

  const loadProfile = useCallback(async () => {
    if (!token) return;
    if (token === mockUser.token) {
      setProfile({ data: mockProfile, loading: false });
      return;
    }
    setProfile((current) => ({ ...current, loading: true, error: undefined }));
    try {
      const nextProfile = await api.fetchProfile(token);
      setProfile({ data: nextProfile, loading: false });
      setUser((current) =>
        current
          ? {
              ...current,
              email: nextProfile.email,
              displayName: nextProfile.displayName,
              phone: nextProfile.phone,
              dateOfBirth: nextProfile.dateOfBirth,
              gender: nextProfile.gender,
              preferences: nextProfile.preferences
            }
          : current
      );
    } catch (error) {
      setProfile({ loading: false, error: String(error) });
    }
  }, [token]);

  const saveProfile = useCallback(
    async (payload: {
      displayName: string;
      email: string;
      phone: string;
      dateOfBirth: string;
      gender: string;
    }) => {
      if (!token) return;
      if (token === mockUser.token) {
        const nextProfile = { ...mockProfile, ...payload };
        setProfile({ data: nextProfile, loading: false });
        setUser((current) =>
          current ? { ...current, email: payload.email, displayName: payload.displayName } : current
        );
        return;
      }
      const nextProfile = await api.updateProfile(token, payload);
      setProfile({ data: nextProfile, loading: false });
      setUser((current) =>
        current
          ? {
              ...current,
              email: nextProfile.email,
              displayName: nextProfile.displayName,
              phone: nextProfile.phone,
              dateOfBirth: nextProfile.dateOfBirth,
              gender: nextProfile.gender,
              preferences: nextProfile.preferences
            }
          : current
      );
    },
    [token]
  );

  const savePreferences = useCallback(
    async (payload: Partial<UserPreferences>) => {
      if (!token) return;
      if (token === mockUser.token) {
        const nextPreferences = { ...mockProfile.preferences, ...payload };
        setProfile((current) => ({
          data: { ...(current.data ?? mockProfile), preferences: nextPreferences },
          loading: false
        }));
        setUser((current) => (current ? { ...current, preferences: nextPreferences } : current));
        return;
      }
      const nextPreferences = await api.updatePreferences(token, payload);
      setProfile((current) => ({
        data: current.data ? { ...current.data, preferences: nextPreferences } : current.data,
        loading: false
      }));
      setUser((current) => (current ? { ...current, preferences: nextPreferences } : current));
    },
    [token]
  );

  const loadLinkedAccounts = useCallback(async () => {
    if (!token) return;
    if (token === mockUser.token) {
      setLinkedAccounts({
        data: {
          linkedAccounts: mockProfile.linkedAccounts,
          paymentMethods: mockProfile.paymentMethods
        },
        loading: false
      });
      return;
    }
    setLinkedAccounts((current) => ({ ...current, loading: true, error: undefined }));
    try {
      setLinkedAccounts({ data: await api.fetchLinkedAccounts(token), loading: false });
    } catch (error) {
      setLinkedAccounts({ loading: false, error: String(error) });
    }
  }, [token]);

  const addLinkedAccount = useCallback(
    async (payload: { accountType: "bank" | "upi"; name: string; detail: string }) => {
      if (!token) return;
      if (token === mockUser.token) {
        setLinkedAccounts((current) => ({
          data: {
            linkedAccounts: [
              ...(current.data?.linkedAccounts ?? mockProfile.linkedAccounts),
              { id: `${Date.now()}-account`, status: "active", ...payload }
            ],
            paymentMethods: current.data?.paymentMethods ?? mockProfile.paymentMethods
          },
          loading: false
        }));
        return;
      }
      setLinkedAccounts({ data: await api.addLinkedAccount(token, payload), loading: false });
    },
    [token]
  );

  const removeLinkedAccount = useCallback(
    async (accountId: string) => {
      if (!token) return;
      if (token === mockUser.token) {
        setLinkedAccounts((current) => ({
          data: {
            linkedAccounts: (current.data?.linkedAccounts ?? mockProfile.linkedAccounts).filter(
              (account) => account.id !== accountId
            ),
            paymentMethods: current.data?.paymentMethods ?? mockProfile.paymentMethods
          },
          loading: false
        }));
        return;
      }
      setLinkedAccounts({ data: await api.removeLinkedAccount(token, accountId), loading: false });
    },
    [token]
  );

  const addPaymentMethod = useCallback(
    async (payload: { name: string; detail: string }) => {
      if (!token) return;
      if (token === mockUser.token) {
        setLinkedAccounts((current) => ({
          data: {
            linkedAccounts: current.data?.linkedAccounts ?? mockProfile.linkedAccounts,
            paymentMethods: [
              ...(current.data?.paymentMethods ?? mockProfile.paymentMethods),
              { id: `${Date.now()}-card`, methodType: "card", ...payload }
            ]
          },
          loading: false
        }));
        return;
      }
      setLinkedAccounts({ data: await api.addPaymentMethod(token, payload), loading: false });
    },
    [token]
  );

  const loadBudgets = useCallback(async () => {
    if (!token) return;
    if (token === mockUser.token) {
      setBudgets({ data: mockBudgets, loading: false });
      return;
    }
    setBudgets((current) => ({ ...current, loading: true, error: undefined }));
    try {
      setBudgets({ data: await api.fetchBudgets(token), loading: false });
    } catch (error) {
      setBudgets({ loading: false, error: String(error) });
    }
  }, [token]);

  const addBudget = useCallback(async () => {
    if (!token) return;
    if (token === mockUser.token) {
      setBudgets((current) => ({
        data: [
          ...(current.data ?? mockBudgets),
          {
            id: `custom-${Date.now()}`,
            category: `custom-${Date.now()}`,
            icon: "sparkles-outline",
            name: "New Budget",
            spent: 0,
            limit: 1000,
            color: "#FF5533"
          }
        ],
        loading: false
      }));
      return;
    }
    setBudgets({
      data: await api.createBudget(token, {
        name: "New Budget",
        category: `custom-${Date.now()}`,
        limit: 1000,
        icon: "sparkles-outline",
        color: "#FF5533"
      }),
      loading: false
    });
  }, [token]);

  const saveBudgetLimit = useCallback(
    async (budgetId: string, limit: number) => {
      if (!token) return;
      if (token === mockUser.token) {
        setBudgets((current) => ({
          data: (current.data ?? mockBudgets).map((item) =>
            item.id === budgetId ? { ...item, limit } : item
          ),
          loading: false
        }));
        return;
      }
      setBudgets({ data: await api.updateBudget(token, budgetId, { limit }), loading: false });
    },
    [token]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!token || !text.trim()) return;
      const userMessage: ChatMessage = {
        id: `${Date.now()}-user`,
        role: "user",
        text: text.trim()
      };
      setChatMessages((current) => [...current, userMessage]);
      setIsSending(true);

      try {
        const parsed = token === mockUser.token ? parseMockTransaction(text) : await api.parseTransaction(token, text.trim());
        setPendingParse(parsed);
        setChatMessages((current) => [
          ...current,
          {
            id: `${Date.now()}-assistant`,
            role: "assistant",
            text: `Got it! ${parsed.type === "income" ? "Credit" : "Debit"} of Rs ${parsed.amount.toFixed(
              0
            )} for ${parsed.category}. Can I confirm this log?`
          }
        ]);
      } catch {
        setPendingParse(undefined);
        setChatMessages((current) => [
          ...current,
          {
            id: `${Date.now()}-error`,
            role: "assistant",
            text:
              'I could not confidently parse that. Try a message like "Spent 200 food at Starbucks".'
          }
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [token]
  );

  const updatePendingParse = useCallback((nextParse: ParseResult) => {
    setPendingParse(nextParse);
  }, []);

  const confirmPending = useCallback(async () => {
    if (!token || !pendingParse) return;
    setIsSaving(true);
    try {
      const transaction =
        token === mockUser.token
          ? {
              id: `${Date.now()}-mock`,
              amount: pendingParse.amount,
              type: pendingParse.type,
              category: pendingParse.category,
              vendor: pendingParse.vendor,
              timestamp: pendingParse.timestamp ?? new Date().toISOString(),
              source: "chat",
              mergeCount: 1
            }
          : await api.createTransaction(token, pendingParse);
      setTransactions((current) => ({
        data: [transaction, ...(current.data ?? [])],
        loading: false
      }));
      setPendingParse(undefined);
      setChatMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-saved`,
          role: "assistant",
          text: `Saved ${transaction.category} for ${transaction.amount.toFixed(
            0
          )}. Your dashboard is updated.`
        }
      ]);
      await Promise.all([loadDashboard(), loadInsights()]);
    } finally {
      setIsSaving(false);
    }
  }, [loadDashboard, loadInsights, pendingParse, token]);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      dashboard,
      transactions,
      insights,
      profile,
      budgets,
      linkedAccounts,
      chatMessages,
      pendingParse,
      isSending,
      isSaving,
      loginWithEmail,
      loginWithGoogle,
      logout,
      loadDashboard,
      loadTransactions,
      loadInsights,
      loadProfile,
      saveProfile,
      savePreferences,
      loadLinkedAccounts,
      addLinkedAccount,
      removeLinkedAccount,
      addPaymentMethod,
      loadBudgets,
      addBudget,
      saveBudgetLimit,
      sendMessage,
      updatePendingParse,
      confirmPending
    }),
    [
      user,
      dashboard,
      transactions,
      insights,
      profile,
      budgets,
      linkedAccounts,
      chatMessages,
      pendingParse,
      isSending,
      isSaving,
      loginWithEmail,
      loginWithGoogle,
      logout,
      loadDashboard,
      loadTransactions,
      loadInsights,
      loadProfile,
      saveProfile,
      savePreferences,
      loadLinkedAccounts,
      addLinkedAccount,
      removeLinkedAccount,
      addPaymentMethod,
      loadBudgets,
      addBudget,
      saveBudgetLimit,
      sendMessage,
      updatePendingParse,
      confirmPending
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function parseMockTransaction(text: string): ParseResult {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  const amount = Number(clean.match(/\d+(?:,\d+)?/)?.[0].replace(",", "") ?? 240);
  const incomeWords = ["salary", "credited", "credit", "received", "income", "paid me", "deposit"];
  const type = incomeWords.some((word) => lower.includes(word)) ? "income" : "expense";
  const category = type === "income"
    ? lower.includes("freelance")
      ? "freelance"
      : "salary"
    : lower.includes("uber") || lower.includes("cab") || lower.includes("fuel")
      ? "transport"
      : lower.includes("zepto") || lower.includes("grocery")
        ? "groceries"
        : "food";
  const vendorMatch = clean.match(/\bat\s+(.+?)(?:\s+\d|\s+rs|\s+rupees|$)/i);
  const vendor = vendorMatch?.[1]?.trim() || (type === "income" ? "Income" : "Manual");

  return {
    amount,
    type,
    category,
    vendor,
    confidence: 0.86,
    originalText: clean
  };
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
