import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";
import { LinkedAccount } from "../types";

const theme = {
  bg: "#121212",
  surface: "#1C1C2A",
  surfaceSoft: "#242436",
  border: "#3F3F46",
  brand: "#FF5533",
  text: "#FFFFFF",
  secondary: "#A1A1AA",
  muted: "#71717A",
  success: "#10B981",
  divider: "#FFFFFF"
};

type LinkedAccountsScreenProps = {
  onBack: () => void;
};

export function LinkedAccountsScreen({ onBack }: LinkedAccountsScreenProps) {
  const {
    addLinkedAccount,
    addPaymentMethod,
    linkedAccounts,
    loadLinkedAccounts,
    removeLinkedAccount
  } = useApp();
  const accounts = linkedAccounts.data?.linkedAccounts ?? [];
  const paymentMethods = linkedAccounts.data?.paymentMethods ?? [];

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        <FakeStatusBar />

        <View style={styles.header}>
          <Pressable onPress={onBack} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Linked Accounts</Text>
          <View style={styles.headerIcon} />
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionKicker}>Connected</Text>
            <View style={styles.accountCard}>
              {accounts.map((account, index) => (
                <View key={account.id}>
                  <AccountRow
                    accountType={account.accountType}
                    detail={account.detail}
                    name={account.name}
                    onRemove={() => void removeLinkedAccount(account.id)}
                  />
                  {index < accounts.length - 1 ? <View style={styles.rowDivider} /> : null}
                </View>
              ))}
              {!accounts.length ? <Text style={styles.emptyText}>No linked accounts yet</Text> : null}
            </View>
            <Pressable
              onPress={() =>
                void addLinkedAccount({
                  accountType: "bank",
                  name: "New Bank Account",
                  detail: "Savings ....0000"
                }).then(loadLinkedAccounts)
              }
              style={({ pressed }) => [styles.addAccountButton, pressed && styles.pressed]}
            >
              <Text style={styles.addAccountText}>+ Add New Account</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionKicker}>Payment Methods</Text>
            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.paymentCard}>
                <View style={styles.paymentRow}>
                  <View style={styles.cardGlyph}>
                    <Ionicons name="card-outline" size={24} color={theme.text} />
                  </View>
                  <View style={styles.paymentCopy}>
                    <Text style={styles.accountName}>{method.name}</Text>
                    <Text style={styles.accountDetail}>{method.detail}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={theme.muted} />
                </View>
              </View>
            ))}
            <Pressable
              onPress={() =>
                void addPaymentMethod({
                  name: "New Card",
                  detail: "Ending in 0000"
                }).then(loadLinkedAccounts)
              }
              style={({ pressed }) => [styles.addCardRow, pressed && styles.pressed]}
            >
              <Ionicons name="add" size={24} color={theme.brand} />
              <Text style={styles.addCardText}>Add Card</Text>
            </Pressable>
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

function AccountRow({
  accountType,
  detail,
  name,
  onRemove
}: {
  accountType: LinkedAccount["accountType"];
  detail: string;
  name: string;
  onRemove: () => void;
}) {
  return (
    <View style={styles.accountRow}>
      <View style={styles.accountLeft}>
        <View style={styles.accountIcon}>
          <Ionicons
            name={accountType === "upi" ? "phone-portrait-outline" : "business-outline"}
            size={22}
            color={theme.text}
          />
        </View>
        <View style={styles.accountCopy}>
          <Text style={styles.accountName}>{name}</Text>
          <Text style={styles.accountDetail}>{detail}</Text>
        </View>
      </View>
      <View style={styles.accountActions}>
        <View style={styles.activeBadge}>
          <Text style={styles.activeText}>ACTIVE</Text>
        </View>
        <Pressable onPress={onRemove}>
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "center",
    backgroundColor: theme.bg,
    flex: 1,
    maxWidth: 402,
    width: "100%"
  },
  page: {
    backgroundColor: theme.bg,
    minHeight: 902,
    paddingBottom: 48
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
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 56,
    paddingHorizontal: 24
  },
  headerIcon: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 24
  },
  headerTitle: {
    color: theme.text,
    flex: 1,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 24,
    marginLeft: 16
  },
  content: {
    gap: 28,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  section: {
    gap: 12
  },
  sectionKicker: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 13,
    textTransform: "uppercase"
  },
  accountCard: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    overflow: "hidden"
  },
  accountRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 78,
    justifyContent: "space-between",
    paddingHorizontal: 18
  },
  accountLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0
  },
  accountIcon: {
    alignItems: "center",
    backgroundColor: theme.surfaceSoft,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    marginRight: 12,
    width: 40
  },
  accountCopy: {
    flex: 1,
    minWidth: 0
  },
  accountName: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 24
  },
  accountDetail: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    marginTop: 2
  },
  accountActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginLeft: 10
  },
  activeBadge: {
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.16)",
    borderRadius: 10,
    height: 20,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  activeText: {
    color: theme.success,
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 12
  },
  removeText: {
    color: theme.brand,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20
  },
  rowDivider: {
    backgroundColor: theme.divider,
    height: 1,
    opacity: 0.08
  },
  addAccountButton: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderRadius: 18,
    height: 56,
    justifyContent: "center"
  },
  addAccountText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 24
  },
  paymentCard: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    overflow: "hidden"
  },
  paymentRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 78,
    paddingHorizontal: 18
  },
  cardGlyph: {
    alignItems: "center",
    backgroundColor: theme.surfaceSoft,
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    marginRight: 12,
    width: 48
  },
  paymentCopy: {
    flex: 1
  },
  addCardRow: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 18,
    flexDirection: "row",
    gap: 12,
    height: 60,
    paddingHorizontal: 18
  },
  addCardText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 24
  },
  pressed: {
    opacity: 0.78
  },
  emptyText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "700",
    padding: 18,
    textAlign: "center"
  }
});
