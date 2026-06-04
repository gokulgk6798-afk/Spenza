import { useMemo, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";
import { BudgetItem } from "../types";

const theme = {
  bg: "#121212",
  surface: "#1C1C2A",
  surfaceSoft: "#242436",
  track: "#2A2A3D",
  brand: "#FF5533",
  text: "#FFFFFF",
  muted: "#71717A",
  indicator: "#71717A"
};

export function BudgetScreen() {
  const { addBudget, budgets, saveBudgetLimit } = useApp();
  const [editingId, setEditingId] = useState<string>();
  const [draftLimit, setDraftLimit] = useState("");
  const budgetRows = budgets.data ?? [];

  const totals = useMemo(() => {
    const spent = budgetRows.reduce((sum, item) => sum + item.spent, 0);
    const limit = budgetRows.reduce((sum, item) => sum + item.limit, 0);
    const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    return { spent, limit, percent };
  }, [budgetRows]);

  function editBudget(item: BudgetItem) {
    setEditingId(item.id);
    setDraftLimit(String(item.limit));
  }

  function saveBudget(id: string) {
    const nextLimit = Number(draftLimit.replace(/,/g, ""));
    if (!Number.isFinite(nextLimit) || nextLimit <= 0) return;
    void saveBudgetLimit(id, Math.round(nextLimit));
    setEditingId(undefined);
    setDraftLimit("");
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <FakeStatusBar />

        <View style={styles.main}>
          <View style={styles.header}>
            <Text style={styles.title}>My Budgets</Text>
            <View style={styles.monthPill}>
              <Text style={styles.monthText}>May 2026</Text>
            </View>
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.summaryBox}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Total usage</Text>
                <Text style={styles.summaryPercent}>{totals.percent}%</Text>
              </View>
              <View style={styles.summaryTrack}>
                <View style={[styles.summaryFill, { width: `${Math.min(totals.percent, 100)}%` }]} />
              </View>
              <View style={styles.summaryMeta}>
                <Text style={styles.summaryMuted}>
                  {formatMoney(totals.spent)} of {formatMoney(totals.limit)}
                </Text>
                <Text style={styles.summaryPercentSmall}>{totals.percent}%</Text>
              </View>
            </View>
            <View style={styles.overviewPill}>
              <Text style={styles.overviewPillText}>{totals.percent}% Monthly Limit Used</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>By Category</Text>

          <View style={styles.categoryList}>
            {budgetRows.map((item) => (
              <BudgetRow
                draftLimit={draftLimit}
                editing={editingId === item.id}
                item={item}
                key={item.id}
                onChangeDraft={setDraftLimit}
                onEdit={() => editBudget(item)}
                onSave={() => saveBudget(item.id)}
              />
            ))}
            {budgets.loading ? <Text style={styles.emptyText}>Loading budgets...</Text> : null}
            {!budgets.loading && !budgetRows.length ? (
              <Text style={styles.emptyText}>No budgets found</Text>
            ) : null}
          </View>

          <Pressable onPress={() => void addBudget()} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
            <Text style={styles.addButtonText}>+ Add Budget</Text>
          </Pressable>
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

function BudgetRow({
  draftLimit,
  editing,
  item,
  onChangeDraft,
  onEdit,
  onSave
}: {
  draftLimit: string;
  editing: boolean;
  item: BudgetItem;
  onChangeDraft: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
}) {
  const percent = item.limit > 0 ? Math.round((item.spent / item.limit) * 100) : 0;

  return (
    <Pressable onPress={onEdit} style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}>
      <View style={styles.categoryTop}>
        <View style={styles.categoryNameWrap}>
          <View style={styles.emojiBox}>
            <Ionicons name={toIconName(item.icon)} size={20} color={theme.text} />
          </View>
          <Text style={styles.categoryName}>{item.name}</Text>
        </View>
        <View style={styles.amountWrap}>
          <Text style={styles.spentText}>{formatMoney(item.spent)}</Text>
          <Text style={styles.limitText}> / {formatMoney(item.limit)}</Text>
        </View>
      </View>
      <View style={styles.categoryTrack}>
        <View
          style={[
            styles.categoryFill,
            { backgroundColor: item.color, width: `${Math.min(percent, 100)}%` }
          ]}
        />
      </View>
      {editing ? (
        <View style={styles.editorRow}>
          <TextInput
            keyboardType="numeric"
            onChangeText={onChangeDraft}
            placeholder="Monthly limit"
            placeholderTextColor={theme.muted}
            style={styles.limitInput}
            value={draftLimit}
          />
          <Pressable onPress={onSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

function toIconName(icon: string): keyof typeof Ionicons.glyphMap {
  return Object.prototype.hasOwnProperty.call(Ionicons.glyphMap, icon)
    ? (icon as keyof typeof Ionicons.glyphMap)
    : "sparkles-outline";
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
    paddingBottom: 128,
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
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  title: {
    color: theme.text,
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 35
  },
  monthPill: {
    alignItems: "center",
    borderColor: theme.text,
    borderRadius: 17,
    borderWidth: 1,
    height: 33,
    justifyContent: "center",
    paddingHorizontal: 16
  },
  monthText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 17
  },
  overviewCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    marginTop: 28,
    minHeight: 214,
    paddingHorizontal: 28,
    paddingTop: 28
  },
  summaryBox: {
    borderColor: theme.text,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 101,
    padding: 20
  },
  summaryHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  summaryTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 17
  },
  summaryPercent: {
    color: theme.brand,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 17
  },
  summaryTrack: {
    backgroundColor: theme.track,
    borderRadius: 5,
    height: 10,
    marginTop: 14,
    overflow: "hidden"
  },
  summaryFill: {
    backgroundColor: theme.brand,
    borderRadius: 5,
    height: 10
  },
  summaryMeta: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8
  },
  summaryMuted: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 14
  },
  summaryPercentSmall: {
    color: theme.brand,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 14
  },
  overviewPill: {
    alignSelf: "center",
    backgroundColor: theme.brand,
    borderRadius: 17,
    height: 33,
    justifyContent: "center",
    marginTop: 24,
    paddingHorizontal: 20,
    minWidth: 196
  },
  overviewPillText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "900"
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 23,
    marginTop: 28
  },
  categoryList: {
    gap: 12,
    marginTop: 16
  },
  categoryCard: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    minHeight: 100,
    padding: 20
  },
  categoryTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  categoryNameWrap: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1
  },
  emojiBox: {
    alignItems: "center",
    backgroundColor: theme.surfaceSoft,
    borderRadius: 10,
    height: 40,
    justifyContent: "center",
    marginRight: 12,
    width: 40
  },
  categoryName: {
    color: theme.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 19
  },
  amountWrap: {
    flexDirection: "row"
  },
  spentText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 17
  },
  limitText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 17
  },
  categoryTrack: {
    backgroundColor: theme.track,
    borderRadius: 4,
    height: 8,
    marginTop: 24,
    overflow: "hidden"
  },
  categoryFill: {
    borderRadius: 4,
    height: 8
  },
  editorRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  limitInput: {
    backgroundColor: theme.surfaceSoft,
    borderColor: theme.brand,
    borderRadius: 12,
    borderWidth: 1,
    color: theme.text,
    flex: 1,
    fontSize: 15,
    height: 42,
    paddingHorizontal: 12
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 18
  },
  saveText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "900"
  },
  addButton: {
    alignItems: "center",
    borderColor: theme.text,
    borderRadius: 28,
    borderWidth: 1,
    height: 55,
    justifyContent: "center",
    marginTop: 20
  },
  addButtonText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 19
  },
  emptyText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center"
  },
  pressed: {
    opacity: 0.82
  }
});
