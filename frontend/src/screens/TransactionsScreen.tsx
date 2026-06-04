import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { MoneyText } from "../components/ui";
import { colors, layout } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { TransactionRecord } from "../types";

const categories = ["all", "food", "transport", "bills", "shopping"];

export function TransactionsScreen() {
  const { transactions, loadTransactions } = useApp();
  const responsive = useResponsiveLayout();
  const [selectedCategory, setSelectedCategory] = useState("all");

  function selectCategory(category: string) {
    setSelectedCategory(category);
    void loadTransactions(category);
  }

  return (
    <View style={[styles.page, { maxWidth: responsive.maxWidth }]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: responsive.horizontalPadding }}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
      >
        {categories.map((category) => {
          const selected = selectedCategory === category;
          return (
            <Pressable
              key={category}
              onPress={() => selectCategory(category)}
              style={[styles.chip, selected && styles.selectedChip]}
            >
              <Text style={[styles.chipText, selected && styles.selectedChipText]}>
                {category.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingHorizontal: responsive.horizontalPadding }
        ]}
      >
        {transactions.loading && !transactions.data ? (
          <Text style={styles.state}>Loading transactions...</Text>
        ) : transactions.error ? (
          <Text style={styles.state}>Unable to load transactions</Text>
        ) : transactions.data?.length ? (
          transactions.data.map((item) => <TransactionRow key={item.id} transaction={item} />)
        ) : (
          <Text style={styles.state}>No transactions found</Text>
        )}
      </ScrollView>
    </View>
  );
}

function TransactionRow({ transaction }: { transaction: TransactionRecord }) {
  const isIncome = transaction.type === "income";
  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: isIncome ? "#ECFDF5" : "#EBF0FF" }]}>
        <Ionicons
          name={isIncome ? "arrow-down" : "card-outline"}
          size={18}
          color={isIncome ? colors.success : colors.primaryBlue}
        />
      </View>
      <View style={styles.rowContent}>
        <Text numberOfLines={1} style={styles.title}>
          {transaction.vendor || transaction.category}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {transaction.category} | {new Date(transaction.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[styles.amount, { color: isIncome ? colors.success : colors.deepNavy }]}>
        <MoneyText value={transaction.amount} />
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    alignSelf: "center",
    flex: 1,
    width: "100%"
  },
  filters: {
    flexGrow: 0,
    paddingTop: 12
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  selectedChip: {
    backgroundColor: colors.deepNavy,
    borderColor: colors.deepNavy
  },
  chipText: {
    color: colors.deepNavy,
    fontSize: 12,
    fontWeight: "900"
  },
  selectedChipText: {
    color: colors.surface
  },
  list: {
    gap: layout.cardGap,
    paddingVertical: layout.sectionGap
  },
  state: {
    color: colors.secondaryText,
    marginTop: 32,
    textAlign: "center"
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12
  },
  iconBox: {
    alignItems: "center",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  rowContent: {
    flex: 1
  },
  title: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  meta: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700"
  },
  amount: {
    fontSize: 13,
    fontWeight: "900"
  }
});
