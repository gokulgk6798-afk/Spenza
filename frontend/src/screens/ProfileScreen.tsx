import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";

const theme = {
  bg: "#121212",
  surface: "#1C1C2A",
  surfaceSoft: "#242436",
  brand: "#FF5533",
  text: "#FFFFFF",
  secondary: "#A1A1AA",
  muted: "#71717A",
  divider: "#FFFFFF",
  indicator: "#71717A"
};

const sections: Array<{
  title: string;
  options: Array<{
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    destructive?: boolean;
  }>;
}> = [
  {
    title: "Account",
    options: [
      { id: "edit-profile", label: "Edit Profile", icon: "person-outline" },
      { id: "linked-accounts", label: "Linked Accounts", icon: "link-outline" }
    ]
  },
  {
    title: "Preferences",
    options: [
      { id: "notifications", label: "Notifications", icon: "notifications-outline" },
      { id: "currency", label: "Currency", icon: "cash-outline" },
      { id: "theme", label: "Theme", icon: "moon-outline" }
    ]
  },
  {
    title: "Support",
    options: [
      { id: "help", label: "Help", icon: "help-circle-outline" },
      { id: "rate-app", label: "Rate App", icon: "star-outline" },
      { id: "logout", label: "Logout", icon: "log-out-outline", destructive: true }
    ]
  }
];

type ProfileScreenProps = {
  onOpenEditProfile?: () => void;
  onOpenLinkedAccounts?: () => void;
  onOpenCurrency?: () => void;
  onOpenHelp?: () => void;
  onOpenTheme?: () => void;
};

export function ProfileScreen({
  onOpenCurrency,
  onOpenEditProfile,
  onOpenHelp,
  onOpenLinkedAccounts,
  onOpenTheme
}: ProfileScreenProps) {
  const { dashboard, logout, transactions, user } = useApp();
  const displayName = user?.displayName?.trim() || "Priya Sharma";
  const email = user?.email || "priya@example.com";
  const initials = getInitials(displayName);
  const saved = dashboard.data?.safety.savings ?? dashboard.data?.balance ?? 42000;
  const expenseCount =
    transactions.data?.filter((transaction) => transaction.type === "expense").length ?? 28;

  function handleOption(id: string) {
    if (id === "edit-profile") {
      onOpenEditProfile?.();
      return;
    }
    if (id === "linked-accounts") {
      onOpenLinkedAccounts?.();
      return;
    }
    if (id === "currency") {
      onOpenCurrency?.();
      return;
    }
    if (id === "theme") {
      onOpenTheme?.();
      return;
    }
    if (id === "help") {
      onOpenHelp?.();
      return;
    }
    if (id === "logout") {
      logout();
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        <FakeStatusBar />

        <View style={styles.main}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.identity}>
              <Text numberOfLines={1} style={styles.name}>
                {displayName}
              </Text>
              <Text numberOfLines={1} style={styles.email}>
                {email}
              </Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <ProfileStat label="Total Saved" value={formatMoney(saved)} />
            <ProfileStat label="Expenses" value={String(expenseCount)} />
            <ProfileStat label="Budgets" value="4" />
          </View>

          <View style={styles.sections}>
            {sections.map((section) => (
              <View key={section.title} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.optionGroup}>
                  {section.options.map((option, index) => (
                    <View key={option.id}>
                      <Pressable
                        onPress={() => handleOption(option.id)}
                        style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}
                      >
                        <View style={styles.optionLeft}>
                          <View style={styles.optionIcon}>
                            <Ionicons
                              name={option.icon}
                              size={19}
                              color={option.destructive ? theme.brand : theme.secondary}
                            />
                          </View>
                          <Text
                            style={[
                              styles.optionLabel,
                              option.destructive && styles.destructiveLabel
                            ]}
                          >
                            {option.label}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.muted} />
                      </Pressable>
                      {index < section.options.length - 1 ? <View style={styles.rowDivider} /> : null}
                    </View>
                  ))}
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

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "P";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function formatMoney(value: number) {
  return `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
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
    paddingHorizontal: 24,
    paddingTop: 24
  },
  profileHeader: {
    alignItems: "center",
    minHeight: 174
  },
  avatar: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderColor: theme.surfaceSoft,
    borderRadius: 50,
    borderWidth: 3,
    height: 100,
    justifyContent: "center",
    width: 100
  },
  avatarText: {
    color: theme.text,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 42
  },
  identity: {
    alignItems: "center",
    marginTop: 16,
    maxWidth: 240
  },
  name: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
    textAlign: "center"
  },
  email: {
    color: theme.muted,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    marginTop: 4,
    textAlign: "center"
  },
  statsCard: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 20,
    flexDirection: "row",
    height: 98,
    justifyContent: "space-between",
    marginTop: 32,
    paddingHorizontal: 24
  },
  statItem: {
    alignItems: "center",
    minWidth: 62
  },
  statLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 24,
    textAlign: "center"
  },
  statValue: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 22,
    marginTop: 4,
    textAlign: "center"
  },
  sections: {
    gap: 24,
    marginTop: 32
  },
  section: {
    gap: 12
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23
  },
  optionGroup: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    overflow: "hidden"
  },
  optionRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 56,
    justifyContent: "space-between",
    paddingLeft: 18,
    paddingRight: 18
  },
  optionLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12
  },
  optionIcon: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 24
  },
  optionLabel: {
    color: theme.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 19
  },
  destructiveLabel: {
    color: theme.brand
  },
  rowDivider: {
    backgroundColor: theme.divider,
    height: 1,
    marginLeft: 54,
    opacity: 0.08
  },
  pressed: {
    opacity: 0.78
  }
});
