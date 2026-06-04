import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";
import { CategoryInsight, TransactionRecord } from "../types";

const theme = {
  bg: "#121212",
  card: "#1C1C2A",
  cardSoft: "#242436",
  cardMuted: "#2A2A3D",
  statSurface: "#FFFFFF",
  text: "#FFFFFF",
  darkText: "#121212",
  secondary: "#A1A1AA",
  muted: "#71717A",
  divider: "#FFFFFF",
  brand: "#FF5533",
  income: "#10B981",
  warning: "#F59E0B",
  danger: "#FF4D55",
  purple: "#8B5CF6",
  blue: "#38BDF8"
};

const fallbackCategories: CategoryInsight[] = [
  { category: "Food", amount: 3920, percentage: 32 },
  { category: "Transport", amount: 2660, percentage: 22 },
  { category: "Shopping", amount: 3030, percentage: 25 },
  { category: "Groceries", amount: 2310, percentage: 19 },
  { category: "Medical", amount: 1420, percentage: 12 }
];

const fallbackWeek = [
  { label: "Mon", amount: 900 },
  { label: "Tue", amount: 1900 },
  { label: "Wed", amount: 600 },
  { label: "Thu", amount: 2900 },
  { label: "Fri", amount: 1600 },
  { label: "Sat", amount: 4800 },
  { label: "Sun", amount: 1200 }
];

const fallbackTrend = [
  { label: "Dec", income: 18000, expense: 13500 },
  { label: "Jan", income: 21000, expense: 15500 },
  { label: "Feb", income: 15000, expense: 12000 },
  { label: "Mar", income: 24000, expense: 19500 },
  { label: "Apr", income: 22000, expense: 17500 },
  { label: "May", income: 24580, expense: 12340 }
];

export function InsightsScreen() {
  const { dashboard, insights, transactions } = useApp();
  const data = insights.data;
  const dashboardData = dashboard.data;
  const transactionData = transactions.data ?? dashboardData?.recentTransactions ?? [];

  if (insights.loading && !data) {
    return <Text style={styles.center}>Loading insights...</Text>;
  }

  const categories = data?.categoryBreakdown.length
    ? normalizeCategories(data.categoryBreakdown)
    : fallbackCategories;
  const categoryTotal = categories.reduce((sum, item) => sum + item.amount, 0);
  const income = dashboardData?.totalIncome ?? 24580;
  const spent = dashboardData?.totalExpense ?? (categoryTotal || 12340);
  const saved = Math.max(0, dashboardData?.balance ?? dashboardData?.safety.savings ?? income - spent);
  const invested = getInvestedAmount(transactionData, saved);
  const weekData = buildWeekData(transactionData, data?.weeklyComparison.currentWeekExpense);
  const trendData = buildTrendData(transactionData, income, spent);
  const merchants = buildMerchants(transactionData);
  const savingsGoal = Math.max(8000, Math.ceil(saved / 1000) * 1000 || 8000);
  const savingsProgress = savingsGoal ? Math.min(1, saved / savingsGoal) : 0;

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        <FakeStatusBar />

        <View style={styles.main}>
          <View style={styles.header}>
            <Text style={styles.title}>Analytics</Text>
            <View style={styles.monthSelector}>
              <Text style={styles.monthText}>May 2026</Text>
              <Ionicons name="chevron-down" size={16} color={theme.secondary} />
            </View>
          </View>

          <View style={styles.statsCard}>
            <StatItem label="Spent" value={formatMoney(spent, true)} />
            <View style={styles.statDivider} />
            <StatItem label="Saved" value={formatMoney(saved, true)} />
            <View style={styles.statDivider} />
            <StatItem label="Invested" value={formatMoney(invested, true)} />
          </View>

          <AnalyticsCard title="Income vs Expense">
            <AmountBar color={theme.income} label="Income" max={Math.max(income, spent)} value={income} />
            <AmountBar color={theme.brand} label="Expense" max={Math.max(income, spent)} value={spent} />
            <View style={styles.surplusRow}>
              <View style={styles.surplusDot} />
              <Text style={styles.surplusText}>{formatMoney(Math.max(0, income - spent))} surplus this month</Text>
            </View>
          </AnalyticsCard>

          <AnalyticsCard title="Spending Breakdown">
            <View style={styles.breakdownList}>
              {categories.slice(0, 5).map((item) => (
                <BreakdownRow key={item.category} item={item} total={categoryTotal || spent} />
              ))}
            </View>
          </AnalyticsCard>

          <AnalyticsCard title="This Week">
            <View style={styles.weekChart}>
              {weekData.map((item) => (
                <WeekBar key={item.label} amount={item.amount} label={item.label} max={maxAmount(weekData)} />
              ))}
            </View>
          </AnalyticsCard>

          <AnalyticsCard title="6 Month Trend">
            <View style={styles.trendChart}>
              {trendData.map((item) => (
                <TrendColumn
                  key={item.label}
                  expense={item.expense}
                  income={item.income}
                  label={item.label}
                  max={maxTrendAmount(trendData)}
                />
              ))}
            </View>
          </AnalyticsCard>

          <AnalyticsCard title="Top Merchants">
            <View style={styles.merchantList}>
              {merchants.map((item, index) => (
                <View key={item.name}>
                  <View style={styles.merchantRow}>
                    <View style={styles.merchantLeft}>
                      <View style={styles.merchantIcon}>
                        <Ionicons name={merchantIcon(item.name)} size={15} color={theme.brand} />
                      </View>
                      <Text numberOfLines={1} style={styles.merchantName}>
                        {item.name}
                      </Text>
                    </View>
                    <Text style={styles.merchantAmount}>{formatMoney(item.amount)}</Text>
                  </View>
                  {index < merchants.length - 1 ? <View style={styles.rowDivider} /> : null}
                </View>
              ))}
            </View>
          </AnalyticsCard>

          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Monthly Savings Goal</Text>
              <View style={styles.goalBadge}>
                <Text style={styles.goalBadgeText}>{Math.round(savingsProgress * 100)}% achieved</Text>
              </View>
            </View>
            <View style={styles.goalTrack}>
              <View style={[styles.goalFill, { width: `${Math.max(4, savingsProgress * 100)}%` }]} />
            </View>
            <Text style={styles.goalCaption}>
              {formatMoney(saved)} of {formatMoney(savingsGoal)} saved
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function FakeStatusBar() {
  return (
    <View style={styles.statusBar}>
      <Text style={styles.statusTime}>9:41</Text>
      <View style={styles.statusIcons}>
        <Ionicons name="cellular" size={15} color={theme.text} />
        <Ionicons name="wifi" size={15} color={theme.text} />
        <Ionicons name="battery-full-outline" size={21} color={theme.text} />
      </View>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function AnalyticsCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function AmountBar({
  color,
  label,
  max,
  value
}: {
  color: string;
  label: string;
  max: number;
  value: number;
}) {
  const width = max ? Math.max(8, (value / max) * 100) : 0;
  return (
    <View style={styles.amountBlock}>
      <View style={styles.amountRow}>
        <View style={styles.amountLeft}>
          <View style={[styles.legendDot, { backgroundColor: color }]} />
          <Text style={styles.amountLabel}>{label}</Text>
        </View>
        <Text style={styles.amountValue}>{formatMoney(value)}</Text>
      </View>
      <View style={styles.amountTrack}>
        <View style={[styles.amountFill, { backgroundColor: color, width: `${width}%` }]} />
      </View>
    </View>
  );
}

function BreakdownRow({ item, total }: { item: CategoryInsight; total: number }) {
  const color = categoryColor(item.category);
  const percentage = item.percentage || (total ? (item.amount / total) * 100 : 0);
  return (
    <View style={styles.breakdownRow}>
      <View style={styles.breakdownLeft}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text numberOfLines={1} style={styles.breakdownName}>
          {titleCase(item.category)}
        </Text>
      </View>
      <View style={styles.breakdownTrack}>
        <View style={[styles.breakdownFill, { backgroundColor: color, width: `${Math.min(100, percentage)}%` }]} />
      </View>
      <View style={styles.breakdownRight}>
        <Text style={styles.breakdownAmount}>{formatMoney(item.amount)}</Text>
        <Text style={styles.breakdownPercent}>{Math.round(percentage)}%</Text>
      </View>
    </View>
  );
}

function WeekBar({ amount, label, max }: { amount: number; label: string; max: number }) {
  const height = max ? Math.max(10, (amount / max) * 96) : 10;
  return (
    <View style={styles.weekItem}>
      <View style={[styles.weekFill, { height }]} />
      <Text style={styles.axisLabel}>{label}</Text>
    </View>
  );
}

function TrendColumn({
  expense,
  income,
  label,
  max
}: {
  expense: number;
  income: number;
  label: string;
  max: number;
}) {
  const incomeHeight = max ? Math.max(18, (income / max) * 106) : 18;
  const expenseHeight = max ? Math.max(18, (expense / max) * 106) : 18;
  return (
    <View style={styles.trendItem}>
      <View style={styles.trendBars}>
        <View style={[styles.trendIncome, { height: incomeHeight }]} />
        <View style={[styles.trendExpense, { height: expenseHeight }]} />
      </View>
      <Text style={styles.axisLabel}>{label}</Text>
    </View>
  );
}

function normalizeCategories(categories: CategoryInsight[]) {
  const total = categories.reduce((sum, item) => sum + item.amount, 0);
  return categories.map((item) => ({
    ...item,
    category: titleCase(item.category),
    percentage: item.percentage || (total ? Number(((item.amount / total) * 100).toFixed(1)) : 0)
  }));
}

function buildWeekData(transactions: TransactionRecord[], currentWeekExpense?: number) {
  const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const totals = labels.map((label) => ({ label, amount: 0 }));

  transactions
    .filter((item) => item.type === "expense")
    .forEach((item) => {
      const label = week[new Date(item.timestamp).getDay()];
      const match = totals.find((entry) => entry.label === label);
      if (match) match.amount += item.amount;
    });

  if (totals.some((item) => item.amount > 0)) return totals;
  if (currentWeekExpense && currentWeekExpense > 0) {
    const weights = [0.08, 0.16, 0.06, 0.22, 0.13, 0.26, 0.09];
    return totals.map((item, index) => ({
      ...item,
      amount: Math.round(currentWeekExpense * weights[index])
    }));
  }
  return fallbackWeek;
}

function buildTrendData(transactions: TransactionRecord[], currentIncome: number, currentExpense: number) {
  const now = new Date();
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: monthFormatter.format(date),
      income: 0,
      expense: 0
    };
  });

  transactions.forEach((item) => {
    const date = new Date(item.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const match = months.find((month) => month.key === key);
    if (!match) return;
    if (item.type === "income") {
      match.income += item.amount;
    } else if (item.type === "expense") {
      match.expense += item.amount;
    }
  });

  if (months.some((item) => item.income > 0 || item.expense > 0)) {
    const current = months[months.length - 1];
    current.income = current.income || currentIncome;
    current.expense = current.expense || currentExpense;
    return months;
  }

  return fallbackTrend;
}

function buildMerchants(transactions: TransactionRecord[]) {
  const totals = transactions
    .filter((item) => item.type === "expense" && item.vendor)
    .reduce<Record<string, number>>((accumulator, item) => {
      const name = titleCase(item.vendor);
      accumulator[name] = (accumulator[name] ?? 0) + item.amount;
      return accumulator;
    }, {});

  const merchants = Object.entries(totals)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return merchants.length
    ? merchants
    : [
        { name: "Swiggy", amount: 3200 },
        { name: "Uber", amount: 1840 },
        { name: "Amazon", amount: 2100 }
      ];
}

function getInvestedAmount(transactions: TransactionRecord[], saved: number) {
  const invested = transactions
    .filter((item) => {
      const category = item.category.toLowerCase();
      return category.includes("invest") || category.includes("stock") || category.includes("mutual");
    })
    .reduce((sum, item) => sum + item.amount, 0);

  if (invested > 0) return invested;
  return Math.min(3000, Math.max(0, Math.round(saved * 0.35)));
}

function maxAmount(items: Array<{ amount: number }>) {
  return Math.max(1, ...items.map((item) => item.amount));
}

function maxTrendAmount(items: Array<{ income: number; expense: number }>) {
  return Math.max(1, ...items.flatMap((item) => [item.income, item.expense]));
}

function formatMoney(value: number, compact = false) {
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard"
  }).format(value);
  return `Rs ${formatted}`;
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function categoryColor(category: string) {
  const key = category.toLowerCase();
  if (key.includes("food") || key.includes("dining")) return theme.brand;
  if (key.includes("transport") || key.includes("uber")) return theme.blue;
  if (key.includes("shop")) return theme.purple;
  if (key.includes("grocery")) return theme.income;
  if (key.includes("medical")) return theme.danger;
  return theme.warning;
}

function merchantIcon(name: string): keyof typeof Ionicons.glyphMap {
  const key = name.toLowerCase();
  if (key.includes("uber") || key.includes("ola")) return "car-outline";
  if (key.includes("amazon") || key.includes("shop")) return "bag-outline";
  if (key.includes("zepto") || key.includes("grocery")) return "cart-outline";
  if (key.includes("starbucks") || key.includes("coffee")) return "cafe-outline";
  return "restaurant-outline";
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.bg,
    flex: 1
  },
  page: {
    alignSelf: "center",
    backgroundColor: theme.bg,
    paddingBottom: 124,
    width: "100%",
    maxWidth: 402
  },
  center: {
    backgroundColor: theme.bg,
    color: theme.secondary,
    flex: 1,
    paddingTop: 64,
    textAlign: "center"
  },
  statusBar: {
    alignItems: "center",
    flexDirection: "row",
    height: 44,
    justifyContent: "space-between",
    paddingHorizontal: 24
  },
  statusTime: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "700"
  },
  statusIcons: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5
  },
  main: {
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: -4
  },
  title: {
    color: theme.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 35
  },
  monthSelector: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    height: 33,
    paddingHorizontal: 14
  },
  monthText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 17
  },
  statsCard: {
    alignItems: "center",
    backgroundColor: theme.statSurface,
    borderRadius: 20,
    flexDirection: "row",
    height: 68,
    paddingHorizontal: 12
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  statLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 13
  },
  statValue: {
    color: theme.darkText,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 20,
    marginTop: 6
  },
  statDivider: {
    backgroundColor: "#E4E4E7",
    height: 44,
    width: 1
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20
  },
  cardTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
    marginBottom: 16
  },
  amountBlock: {
    gap: 12,
    marginBottom: 14
  },
  amountRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  amountLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  legendDot: {
    borderRadius: 5,
    height: 10,
    width: 10
  },
  amountLabel: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "600"
  },
  amountValue: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "900"
  },
  amountTrack: {
    backgroundColor: theme.cardMuted,
    borderRadius: 5,
    height: 10,
    overflow: "hidden"
  },
  amountFill: {
    borderRadius: 5,
    height: 10
  },
  surplusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 2
  },
  surplusDot: {
    backgroundColor: theme.income,
    borderRadius: 4,
    height: 8,
    width: 8
  },
  surplusText: {
    color: theme.income,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 16
  },
  breakdownList: {
    gap: 12
  },
  breakdownRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    minHeight: 17
  },
  breakdownLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    width: 78
  },
  breakdownName: {
    color: theme.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "600"
  },
  breakdownTrack: {
    backgroundColor: theme.cardMuted,
    borderRadius: 3,
    flex: 1,
    height: 6,
    overflow: "hidden"
  },
  breakdownFill: {
    borderRadius: 3,
    height: 6
  },
  breakdownRight: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
    width: 80
  },
  breakdownAmount: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "900"
  },
  breakdownPercent: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    minWidth: 24
  },
  weekChart: {
    alignItems: "flex-end",
    flexDirection: "row",
    height: 120,
    justifyContent: "space-between"
  },
  weekItem: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: 36
  },
  weekFill: {
    backgroundColor: theme.brand,
    borderRadius: 9,
    marginBottom: 6,
    width: 18
  },
  axisLabel: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 13
  },
  trendChart: {
    alignItems: "flex-end",
    flexDirection: "row",
    height: 140,
    justifyContent: "space-between"
  },
  trendItem: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: 44
  },
  trendBars: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 6,
    height: 110,
    marginBottom: 8
  },
  trendIncome: {
    backgroundColor: theme.income,
    borderRadius: 9,
    width: 18
  },
  trendExpense: {
    backgroundColor: theme.brand,
    borderRadius: 9,
    width: 18
  },
  merchantList: {
    gap: 12
  },
  merchantRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  merchantLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
    paddingRight: 12
  },
  merchantIcon: {
    alignItems: "center",
    backgroundColor: theme.cardSoft,
    borderRadius: 10,
    height: 24,
    justifyContent: "center",
    width: 24
  },
  merchantName: {
    color: theme.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "700"
  },
  merchantAmount: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "900"
  },
  rowDivider: {
    backgroundColor: theme.divider,
    height: 1,
    marginTop: 12,
    opacity: 0.08
  },
  goalCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    gap: 12,
    padding: 20
  },
  goalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  goalTitle: {
    color: theme.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 17
  },
  goalBadge: {
    backgroundColor: theme.brand,
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  goalBadgeText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 14
  },
  goalTrack: {
    backgroundColor: theme.cardMuted,
    borderRadius: 4,
    height: 8,
    overflow: "hidden"
  },
  goalFill: {
    backgroundColor: theme.brand,
    borderRadius: 4,
    height: 8
  },
  goalCaption: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 16
  }
});
