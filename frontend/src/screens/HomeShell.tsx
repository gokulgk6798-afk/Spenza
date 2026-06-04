import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "../context/AppContext";
import { BudgetScreen } from "./BudgetScreen";
import { ChatScreen } from "./ChatScreen";
import { CurrencyScreen } from "./CurrencyScreen";
import { DashboardScreen } from "./DashboardScreen";
import { HelpSupportScreen } from "./HelpSupportScreen";
import { InsightsScreen } from "./InsightsScreen";
import { LinkedAccountsScreen } from "./LinkedAccountsScreen";
import { ProfileEditScreen } from "./ProfileEditScreen";
import { PrivacyPolicyScreen } from "./PrivacyPolicyScreen";
import { ProfileScreen } from "./ProfileScreen";
import { ThemeScreen } from "./ThemeScreen";
import { TermsOfServiceScreen } from "./TermsOfServiceScreen";

type Tab = "home" | "analytics" | "budget" | "profile" | "chat";
type ProfileRoute =
  | "menu"
  | "edit"
  | "linked-accounts"
  | "currency"
  | "theme"
  | "help"
  | "privacy-policy"
  | "terms-of-service";

const tabs: Array<{
  id: Tab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}> = [
  { id: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
  { id: "analytics", label: "Analytics", icon: "analytics-outline", activeIcon: "analytics" },
  { id: "budget", label: "Budget", icon: "wallet-outline", activeIcon: "wallet" },
  { id: "profile", label: "Profile", icon: "person-outline", activeIcon: "person" }
];

const shellTheme = {
  bg: "#121212",
  nav: "#1C1C2A",
  brand: "#FF5533",
  text: "#FFFFFF",
  inactive: "#71717A",
  indicator: "#71717A"
};

export function HomeShell() {
  const [tab, setTab] = useState<Tab>("home");
  const [profileRoute, setProfileRoute] = useState<ProfileRoute>("menu");
  const { loadBudgets, loadDashboard, loadInsights, loadLinkedAccounts, loadProfile, loadTransactions } = useApp();

  function selectTab(nextTab: Tab) {
    setTab(nextTab);
    if (nextTab === "profile") {
      setProfileRoute("menu");
    }
  }

  useEffect(() => {
    void Promise.all([
      loadDashboard(),
      loadTransactions(),
      loadInsights(),
      loadProfile(),
      loadLinkedAccounts(),
      loadBudgets()
    ]);
  }, [loadBudgets, loadDashboard, loadInsights, loadLinkedAccounts, loadProfile, loadTransactions]);

  const screen =
    tab === "home" ? (
      <DashboardScreen onOpenProfile={() => setTab("profile")} />
    ) : tab === "analytics" ? (
      <InsightsScreen />
    ) : tab === "budget" ? (
      <BudgetScreen />
    ) : tab === "chat" ? (
      <ChatScreen onClose={() => setTab("home")} />
    ) : profileRoute === "edit" ? (
      <ProfileEditScreen onBack={() => setProfileRoute("menu")} />
    ) : profileRoute === "linked-accounts" ? (
      <LinkedAccountsScreen onBack={() => setProfileRoute("menu")} />
    ) : profileRoute === "currency" ? (
      <CurrencyScreen onBack={() => setProfileRoute("menu")} />
    ) : profileRoute === "theme" ? (
      <ThemeScreen onBack={() => setProfileRoute("menu")} />
    ) : profileRoute === "help" ? (
      <HelpSupportScreen
        onBack={() => setProfileRoute("menu")}
        onOpenPrivacyPolicy={() => setProfileRoute("privacy-policy")}
        onOpenTermsOfService={() => setProfileRoute("terms-of-service")}
      />
    ) : profileRoute === "privacy-policy" ? (
      <PrivacyPolicyScreen onBack={() => setProfileRoute("help")} />
    ) : profileRoute === "terms-of-service" ? (
      <TermsOfServiceScreen onBack={() => setProfileRoute("help")} />
    ) : (
      <ProfileScreen
        onOpenCurrency={() => setProfileRoute("currency")}
        onOpenEditProfile={() => setProfileRoute("edit")}
        onOpenHelp={() => setProfileRoute("help")}
        onOpenLinkedAccounts={() => setProfileRoute("linked-accounts")}
        onOpenTheme={() => setProfileRoute("theme")}
      />
    );

  if (tab === "chat" || (tab === "profile" && profileRoute !== "menu")) {
    return <View style={styles.shell}>{screen}</View>;
  }

  return (
    <View style={styles.shell}>
      <View style={styles.body}>{screen}</View>
      {tab === "home" ? (
        <Pressable onPress={() => setTab("chat")} style={styles.expenseFab}>
          <Ionicons name="chatbubble-outline" size={23} color={shellTheme.text} />
          <Text style={styles.expenseFabText}>Add Expense</Text>
        </Pressable>
      ) : null}
      <SafeAreaView edges={["bottom"]} style={styles.navWrap}>
        <View style={styles.nav}>
          {tabs.map((item) => (
            <Pressable key={item.id} onPress={() => selectTab(item.id)} style={styles.navItem}>
              <Ionicons
                name={tab === item.id ? item.activeIcon : item.icon}
                size={25}
                color={tab === item.id ? shellTheme.brand : shellTheme.inactive}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.navLabel,
                  { color: tab === item.id ? shellTheme.brand : shellTheme.inactive }
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.homeIndicator} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: shellTheme.bg,
    flex: 1
  },
  body: {
    flex: 1
  },
  expenseFab: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: shellTheme.brand,
    borderRadius: 24,
    bottom: 88,
    flexDirection: "row",
    gap: 12,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 20,
    position: "absolute",
    right: 24,
    shadowColor: shellTheme.brand,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.36,
    shadowRadius: 18,
    zIndex: 4,
    elevation: 12
  },
  expenseFabText: {
    color: shellTheme.text,
    fontSize: 14,
    fontWeight: "900"
  },
  navWrap: {
    backgroundColor: shellTheme.nav,
    borderColor: "#FFFFFF",
    borderTopWidth: 1,
    width: "100%"
  },
  nav: {
    alignSelf: "center",
    flexDirection: "row",
    height: 80,
    maxWidth: 402,
    paddingHorizontal: 16,
    paddingTop: 18,
    width: "100%"
  },
  navItem: {
    alignItems: "center",
    flex: 1,
    height: 44,
    justifyContent: "center"
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 13,
    marginTop: 4
  },
  homeIndicator: {
    alignSelf: "center",
    backgroundColor: shellTheme.indicator,
    borderRadius: 3,
    height: 5,
    marginBottom: 8,
    marginTop: 6,
    opacity: 0.7,
    width: 134
  }
});
