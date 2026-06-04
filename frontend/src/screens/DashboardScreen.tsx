import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";

const theme = {
  bg: "#121212",
  surface: "#1C1C2A",
  surfaceSoft: "#242436",
  surfaceMuted: "#2A2A3D",
  brand: "#FF5533",
  brandEnd: "#F04636",
  text: "#FFFFFF",
  secondary: "#A1A1AA",
  muted: "#71717A",
  divider: "#FFFFFF",
  green: "#10B981",
  yellow: "#F59E0B",
  danger: "#FF4D55"
};

const budgetRows = [
  { icon: "🍔", label: "Food", spent: "₹3,200", limit: "₹5,000", percent: 64, color: theme.brand },
  { icon: "🚗", label: "Transport", spent: "₹1,840", limit: "₹3,000", percent: 61, color: theme.brand },
  { icon: "🛍️", label: "Shopping", spent: "₹4,500", limit: "₹5,000", percent: 90, color: theme.yellow, alert: true },
  { icon: "🛒", label: "Groceries", spent: "₹2,100", limit: "₹3,000", percent: 70, color: theme.brand }
];

const todayChips = [
  { icon: "☕", label: "Starbucks", amount: "₹180" },
  { icon: "🚗", label: "Uber", amount: "₹320" },
  { icon: "🛒", label: "Zepto", amount: "" }
];

const transactions = [
  { icon: "☕", title: "Starbucks", category: "Coffee", time: "Today", amount: "-₹180" },
  { icon: "🚗", title: "Uber", category: "Transport", time: "Today", amount: "-₹320" },
  { icon: "🛒", title: "Zepto", category: "Groceries", time: "Yesterday", amount: "-₹1,240" }
];

type DashboardScreenProps = {
  onOpenProfile?: () => void;
};

export function DashboardScreen({ onOpenProfile }: DashboardScreenProps) {
  const { dashboard } = useApp();

  if (dashboard.loading && !dashboard.data) {
    return <Text style={styles.center}>Loading dashboard...</Text>;
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
        bounces={false}
      >
        <FakeStatusBar />

        <View style={styles.main}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hi, Rahul 👋</Text>
              <Text style={styles.date}>Friday, 22 May</Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable onPress={() => undefined} style={styles.iconCircle}>
                <Ionicons name="notifications-outline" size={22} color={theme.text} />
                <View style={styles.notificationDot} />
              </Pressable>
              <Pressable onPress={onOpenProfile} style={styles.avatar}>
                <Text style={styles.avatarText}>R</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <View style={styles.balanceColumns}>
              <BalanceColumn label="Income" value="₹24,580" />
              <View style={styles.balanceDivider} />
              <BalanceColumn label="Spent" value="₹12,340" />
              <View style={styles.balanceDivider} />
              <BalanceColumn label="Balance" value="₹12,240" />
            </View>
            <View style={styles.balanceRule} />
            <View style={styles.progressTrackLarge}>
              <View style={styles.progressFillLarge} />
            </View>
            <Text style={styles.balanceCaption}>50% of income spent • 16 days left in May</Text>
          </View>

          <View style={styles.insightBanner}>
            <View style={styles.insightIcon} />
            <Text style={styles.insightText}>
              You spend most on Food &amp; Transport - together 50% of your budget. Consider
              reducing dining out.
            </Text>
            <Text style={styles.insightAction}>View Details →</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.sectionTitle}>Budget Health</Text>
              <View style={styles.healthBadge}>
                <Text style={styles.healthBadgeText}>On Track</Text>
              </View>
            </View>

            {budgetRows.map((row, index) => (
              <View key={row.label}>
                <View style={styles.budgetRow}>
                  <View style={styles.budgetLeft}>
                    <View style={styles.emojiCircle}>
                      <Text style={styles.emoji}>{row.icon}</Text>
                    </View>
                    <View>
                      <Text style={styles.budgetName}>{row.label}</Text>
                      <Text style={styles.budgetAmount}>
                        {row.spent} / {row.limit}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.budgetRight}>
                    <View style={styles.budgetBar}>
                      <View
                        style={[
                          styles.budgetFill,
                          { width: `${row.percent}%`, backgroundColor: row.color }
                        ]}
                      />
                    </View>
                    <Text style={styles.budgetPercent}>{row.percent}%</Text>
                    {row.alert ? (
                      <Ionicons name="warning-outline" size={15} color={theme.yellow} />
                    ) : null}
                  </View>
                </View>
                {index < budgetRows.length - 1 ? <View style={styles.rowDivider} /> : null}
              </View>
            ))}

            <Text style={styles.linkText}>See all budgets →</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Today</Text>
            <View style={styles.todayPills}>
              <TodayPill label="Spent Today" value="₹680" trend="down" />
              <TodayPill label="vs Yesterday" value="₹420" badge="+62%" />
            </View>
            <View style={styles.todayChips}>
              {todayChips.map((chip) => (
                <View key={chip.label} style={styles.todayChip}>
                  <Text style={styles.chipEmoji}>{chip.icon}</Text>
                  <Text numberOfLines={1} style={styles.chipLabel}>
                    {chip.label}
                  </Text>
                  {chip.amount ? <Text style={styles.chipAmount}>{chip.amount}</Text> : null}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.savingsCard}>
            <View style={styles.savingsLeft}>
              <View style={styles.ringOuter}>
                <View style={styles.ringInner}>
                  <Text style={styles.ringLabel}>Saved</Text>
                  <Text style={styles.ringValue}>65%</Text>
                </View>
              </View>
              <Ionicons name="trophy-outline" size={21} color={theme.brand} />
            </View>
            <View style={styles.savingsRight}>
              <Text style={styles.savingsLabel}>Monthly Goal</Text>
              <Text style={styles.savingsValue}>₹5,200 of ₹8,000 saved</Text>
              <Text style={styles.savingsNote}>₹2,800 to go - you're on track!</Text>
              <View style={styles.savingsLine} />
            </View>
          </View>

          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <Text style={styles.seeAll}>See all</Text>
          </View>

          <View style={styles.transactionList}>
            {transactions.map((item) => (
              <View key={item.title} style={styles.transactionRow}>
                <View style={styles.txIcon}>
                  <Text style={styles.txEmoji}>{item.icon}</Text>
                </View>
                <View style={styles.txBody}>
                  <Text style={styles.txTitle}>{item.title}</Text>
                  <Text style={styles.txCategory}>{item.category}</Text>
                </View>
                <View style={styles.txMeta}>
                  <Text style={styles.txTime}>{item.time}</Text>
                  <Text style={styles.txAmount}>{item.amount}</Text>
                </View>
              </View>
            ))}
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

function BalanceColumn({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.balanceColumn}>
      <Text style={styles.balanceLabel}>{label}</Text>
      <Text style={styles.balanceValue}>{value}</Text>
    </View>
  );
}

function TodayPill({
  label,
  value,
  trend,
  badge
}: {
  label: string;
  value: string;
  trend?: "down";
  badge?: string;
}) {
  return (
    <View style={styles.todayPill}>
      <Text style={styles.todayPillLabel}>{label}</Text>
      <View style={styles.pillDivider} />
      <Text style={styles.todayPillValue}>{value}</Text>
      {trend ? <Ionicons name="arrow-down" size={14} color={theme.muted} /> : null}
      {badge ? (
        <View style={styles.percentBadge}>
          <Text style={styles.percentBadgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
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
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1
  },
  greeting: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 30
  },
  date: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4
  },
  headerActions: {
    flexDirection: "row",
    gap: 12
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    position: "relative",
    width: 40
  },
  notificationDot: {
    backgroundColor: theme.brand,
    borderColor: theme.surface,
    borderRadius: 4,
    borderWidth: 1.5,
    height: 8,
    position: "absolute",
    right: 10,
    top: 10,
    width: 8
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#5C443A",
    borderColor: "#27273A",
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  avatarText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900"
  },
  balanceCard: {
    backgroundColor: theme.brand,
    borderRadius: 24,
    minHeight: 137,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingTop: 20,
    shadowColor: theme.brand,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.34,
    shadowRadius: 22,
    elevation: 10
  },
  balanceColumns: {
    flexDirection: "row",
    height: 44
  },
  balanceColumn: {
    flex: 1
  },
  balanceDivider: {
    backgroundColor: "#FFFFFF",
    height: 44,
    opacity: 0.9,
    width: 1
  },
  balanceLabel: {
    color: "#FFF3EF",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14
  },
  balanceValue: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
    marginTop: 4
  },
  balanceRule: {
    backgroundColor: "#FFFFFF",
    height: 1,
    marginTop: 12,
    opacity: 0.9
  },
  progressTrackLarge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    height: 6,
    marginTop: 12,
    overflow: "hidden"
  },
  progressFillLarge: {
    backgroundColor: "#FFFFFF",
    height: 6,
    width: "57%"
  },
  balanceCaption: {
    color: "#FFF3EF",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 16,
    marginTop: 10
  },
  insightBanner: {
    backgroundColor: theme.surface,
    borderColor: theme.brand,
    borderLeftWidth: 3,
    borderRadius: 20,
    flexDirection: "row",
    minHeight: 108,
    paddingBottom: 16,
    paddingLeft: 14,
    paddingRight: 16,
    paddingTop: 16
  },
  insightIcon: {
    backgroundColor: theme.brand,
    borderRadius: 16,
    height: 32,
    marginRight: 12,
    width: 32
  },
  insightText: {
    color: theme.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 19,
    paddingRight: 6
  },
  insightAction: {
    color: theme.brand,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 16
  },
  cardTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 2
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 23
  },
  healthBadge: {
    backgroundColor: theme.green,
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    paddingHorizontal: 18
  },
  healthBadgeText: {
    color: theme.green,
    fontSize: 1
  },
  budgetRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 71,
    justifyContent: "space-between"
  },
  budgetLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    width: 150
  },
  emojiCircle: {
    alignItems: "center",
    backgroundColor: theme.surfaceSoft,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  emoji: {
    fontSize: 14
  },
  budgetName: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 16
  },
  budgetAmount: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 15,
    marginTop: 2
  },
  budgetRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9
  },
  budgetBar: {
    backgroundColor: theme.surfaceMuted,
    borderRadius: 3,
    height: 6,
    overflow: "hidden",
    width: 120
  },
  budgetFill: {
    borderRadius: 3,
    height: 6
  },
  budgetPercent: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 14,
    minWidth: 25
  },
  rowDivider: {
    backgroundColor: "#FFFFFF",
    height: 1,
    opacity: 0.9
  },
  linkText: {
    color: theme.brand,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 16,
    marginTop: 8
  },
  todayPills: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12
  },
  todayPill: {
    alignItems: "center",
    backgroundColor: theme.surfaceSoft,
    borderRadius: 18,
    flex: 1,
    flexDirection: "row",
    height: 37,
    paddingHorizontal: 12
  },
  todayPillLabel: {
    color: theme.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: "500"
  },
  pillDivider: {
    backgroundColor: theme.muted,
    borderRadius: 1,
    height: 2,
    marginHorizontal: 8,
    width: 2
  },
  todayPillValue: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "900",
    marginRight: 4
  },
  percentBadge: {
    backgroundColor: theme.brand,
    borderRadius: 8,
    marginLeft: 4,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  percentBadgeText: {
    color: theme.text,
    fontSize: 11,
    fontWeight: "900"
  },
  todayChips: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  todayChip: {
    alignItems: "center",
    backgroundColor: theme.surfaceSoft,
    borderRadius: 15,
    flexDirection: "row",
    height: 30,
    paddingHorizontal: 10
  },
  chipEmoji: {
    fontSize: 13,
    marginRight: 8
  },
  chipLabel: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "800",
    maxWidth: 68
  },
  chipAmount: {
    color: theme.danger,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 8
  },
  savingsCard: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 20,
    flexDirection: "row",
    minHeight: 124,
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  savingsLeft: {
    alignItems: "center",
    gap: 7,
    width: 112
  },
  ringOuter: {
    alignItems: "center",
    borderColor: theme.brand,
    borderLeftColor: theme.surfaceMuted,
    borderRadius: 32,
    borderWidth: 7,
    height: 64,
    justifyContent: "center",
    transform: [{ rotate: "-30deg" }],
    width: 64
  },
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "30deg" }]
  },
  ringLabel: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 13
  },
  ringValue: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 21
  },
  savingsRight: {
    flex: 1
  },
  savingsLabel: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 16
  },
  savingsValue: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 20,
    marginTop: 8
  },
  savingsNote: {
    color: theme.green,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 16,
    marginTop: 8
  },
  savingsLine: {
    backgroundColor: theme.green,
    height: 2,
    marginTop: 8
  },
  recentHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 1
  },
  seeAll: {
    color: theme.brand,
    fontSize: 13,
    fontWeight: "900"
  },
  transactionList: {
    gap: 12
  },
  transactionRow: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 14,
    flexDirection: "row",
    height: 60,
    paddingHorizontal: 12
  },
  txIcon: {
    alignItems: "center",
    backgroundColor: theme.surfaceSoft,
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    marginRight: 12,
    width: 36
  },
  txEmoji: {
    fontSize: 16
  },
  txBody: {
    flex: 1
  },
  txTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 17
  },
  txCategory: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 14,
    marginTop: 2
  },
  txMeta: {
    alignItems: "flex-end"
  },
  txTime: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 14
  },
  txAmount: {
    color: theme.danger,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 17,
    marginTop: 2
  }
});
