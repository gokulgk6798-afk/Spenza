import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";
import { ChatMessage, ParseResult } from "../types";

const theme = {
  bg: "#121212",
  surface: "#1C1C2A",
  surfaceSoft: "#242436",
  keyboard: "#2F2F2F",
  brand: "#FF5533",
  text: "#FFFFFF",
  muted: "#71717A",
  dim: "#3F3F46",
  indicator: "#71717A",
  overlay: "rgba(0, 0, 0, 0.62)",
  sheet: "#1C1C2A",
  field: "#242436",
  border: "#3F3F46",
  success: "#10B981"
};

const categoryOptions = [
  { label: "Food", value: "food", icon: "fast-food-outline" },
  { label: "Transport", value: "transport", icon: "car-outline" },
  { label: "Shopping", value: "shopping", icon: "bag-outline" },
  { label: "Entertainment", value: "entertainment", icon: "game-controller-outline" },
  { label: "Fitness", value: "fitness", icon: "barbell-outline" },
  { label: "Groceries", value: "groceries", icon: "cart-outline" },
  { label: "Medical", value: "medical", icon: "medkit-outline" },
  { label: "Salary", value: "salary", icon: "cash-outline" },
  { label: "Bills", value: "bills", icon: "receipt-outline" },
  { label: "Refund", value: "refund", icon: "refresh-outline" },
  { label: "Income", value: "income", icon: "trending-up-outline" },
  { label: "Others", value: "other", icon: "apps-outline" }
] as const;

const paymentMethods = ["Cash", "UPI", "Card", "Bank", "ATM", "Auto debit"];
const dateOptions = [
  { label: "Today", offset: 0 },
  { label: "Yesterday", offset: -1 },
  { label: "Custom", offset: 0 }
];

type EditForm = {
  amount: string;
  category: string;
  dateLabel: string;
  note: string;
  paymentMethod: string;
  type: string;
};

type ChatScreenProps = {
  onClose?: () => void;
};

export function ChatScreen({ onClose }: ChatScreenProps) {
  const {
    chatMessages,
    pendingParse,
    pendingSmsSuggestions,
    isSending,
    isSaving,
    isScanningSms,
    sendMessage,
    scanSmsMessages,
    editSmsSuggestion,
    ignoreSmsSuggestion,
    updatePendingParse,
    confirmPending
  } = useApp();
  const [text, setText] = useState("");
  const [editVisible, setEditVisible] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>(() => buildEditForm());
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (pendingParse) {
      setEditForm(buildEditForm(pendingParse));
    }
  }, [pendingParse]);

  function submit() {
    const next = text.trim();
    if (!next || isSending) return;
    setText("");
    void sendMessage(next);
  }

  function editPending() {
    if (!pendingParse) return;
    setEditForm(buildEditForm(pendingParse));
    setEditVisible(true);
  }

  function editSms(index: number) {
    const suggestion = pendingSmsSuggestions[index];
    if (!suggestion) return;
    editSmsSuggestion(index);
    setEditForm(buildEditForm(suggestion));
    setEditVisible(true);
  }

  function saveEdit() {
    if (!pendingParse) return;
    const amount = Number(editForm.amount.replace(/,/g, ""));
    if (!amount || Number.isNaN(amount)) return;
    const note = editForm.note.trim();

    updatePendingParse({
      ...pendingParse,
      amount,
      type: editForm.type,
      category: editForm.category,
      vendor: note,
      originalText: note || pendingParse.originalText,
      timestamp: dateForOption(editForm.dateLabel).toISOString(),
      paymentMethod: editForm.paymentMethod
    });
    setEditVisible(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <StatusBar hidden />
      <FakeStatusBar />

      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <Text style={styles.titleEmoji}>💬</Text>
          <Text style={styles.title}>Add Expense</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-circle-outline" size={22} color={theme.text} />
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        contentContainerStyle={styles.messages}
        data={chatMessages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => <MessageBubble message={item} />}
        showsVerticalScrollIndicator={false}
      />

      {pendingSmsSuggestions.length ? (
        <View style={styles.smsPanel}>
          <Text style={styles.smsPanelTitle}>Detected today</Text>
          {pendingSmsSuggestions.map((suggestion, index) => (
            <SmsSuggestionCard
              disabled={isSaving}
              key={suggestion.sourceReferenceHash ?? `${suggestion.amount}-${index}`}
              onConfirm={() => void confirmPending(suggestion, index)}
              onEdit={() => editSms(index)}
              onIgnore={() => ignoreSmsSuggestion(index)}
              suggestion={suggestion}
            />
          ))}
        </View>
      ) : null}

      {pendingParse ? (
        <View style={styles.confirmBubble}>
          <Text style={styles.confirmText}>
            {pendingParse.type === "income" ? "Credit" : "Debit"} detected: ₹
            {pendingParse.amount.toFixed(0)} on {pendingParse.category}
            {pendingParse.vendor ? ` — ${pendingParse.vendor}` : ""}. Can I confirm this log?
          </Text>
          <View style={styles.confirmActions}>
            <Pressable
              disabled={isSaving}
              onPress={() => void confirmPending()}
              style={({ pressed }) => [styles.saveChip, pressed && styles.pressed]}
            >
              <Text style={styles.saveChipText}>{isSaving ? "Saving..." : "✓ Yes, save it"}</Text>
            </Pressable>
            <Pressable onPress={editPending} style={({ pressed }) => [styles.editChip, pressed && styles.pressed]}>
              <Text style={styles.editChipText}>✎ Edit</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.followUp}>
          <Text style={styles.followUpText}>Anything else to add?</Text>
          <View style={styles.followUpActions}>
            <Pressable
              disabled={isScanningSms}
              onPress={() => void scanSmsMessages()}
              style={[styles.secondaryChip, isScanningSms && styles.disabledChip]}
            >
              <Text style={styles.secondaryChipText}>{isScanningSms ? "Scanning..." : "Scan SMS"}</Text>
            </Pressable>
            <Pressable onPress={() => inputRef.current?.focus()} style={styles.secondaryChip}>
              <Text style={styles.secondaryChipText}>+ Add more</Text>
            </Pressable>
            <Pressable onPress={onClose} style={styles.secondaryChip}>
              <Text style={styles.secondaryChipText}>Done for now</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.inputPanel}>
        <View style={styles.inputBar}>
          <Ionicons name="mic-outline" size={24} color={theme.muted} />
          <TextInput
            ref={inputRef}
            onChangeText={setText}
            onSubmitEditing={submit}
            placeholder="Type a message..."
            placeholderTextColor={theme.muted}
            returnKeyType="send"
            style={styles.input}
            value={text}
          />
          <Pressable disabled={isSending} onPress={submit} style={styles.sendButton}>
            <Ionicons name="send-outline" size={22} color={theme.text} />
          </Pressable>
        </View>
        <KeyboardPreview />
        <View style={styles.homeIndicator} />
      </View>

      <EditTransactionModal
        form={editForm}
        onCancel={() => setEditVisible(false)}
        onChange={setEditForm}
        onSave={saveEdit}
        pendingParse={pendingParse}
        visible={editVisible}
      />
    </KeyboardAvoidingView>
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

function MessageBubble({ message }: { message: ChatMessage }) {
  const fromUser = message.role === "user";
  return (
    <View style={[styles.bubble, fromUser ? styles.userBubble : styles.assistantBubble]}>
      <Text style={[styles.bubbleText, fromUser ? styles.userText : styles.assistantText]}>
        {message.text}
      </Text>
    </View>
  );
}

function SmsSuggestionCard({
  disabled,
  onConfirm,
  onEdit,
  onIgnore,
  suggestion
}: {
  disabled: boolean;
  onConfirm: () => void;
  onEdit: () => void;
  onIgnore: () => void;
  suggestion: ParseResult;
}) {
  return (
    <View style={styles.smsCard}>
      <View style={styles.smsCardHeader}>
        <Text style={styles.smsAmount}>
          {suggestion.type === "income" ? "+" : "-"}Rs {suggestion.amount.toFixed(0)}
        </Text>
        <Text style={styles.smsType}>{suggestion.type === "income" ? "Income" : "Expense"}</Text>
      </View>
      <Text numberOfLines={1} style={styles.smsMeta}>
        {suggestion.vendor || suggestion.paymentMethod || "Bank transaction"}
      </Text>
      <Text style={styles.smsCategory}>Suggested: {titleCase(normalizeCategory(suggestion.category))}</Text>
      <View style={styles.smsActions}>
        <Pressable disabled={disabled} onPress={onConfirm} style={styles.saveChip}>
          <Text style={styles.saveChipText}>{disabled ? "Saving..." : "Confirm"}</Text>
        </Pressable>
        <Pressable onPress={onEdit} style={styles.editChip}>
          <Text style={styles.editChipText}>Edit</Text>
        </Pressable>
        <Pressable onPress={onIgnore} style={styles.ignoreChip}>
          <Text style={styles.ignoreChipText}>Ignore</Text>
        </Pressable>
      </View>
    </View>
  );
}

function KeyboardPreview() {
  const rows = [10, 9, 7];
  return (
    <View style={styles.keyboard}>
      {rows.map((count, rowIndex) => (
        <View key={rowIndex} style={styles.keyRow}>
          {Array.from({ length: count }).map((_, index) => (
            <View
              key={`${rowIndex}-${index}`}
              style={[
                styles.key,
                rowIndex === 2 && index === 3 ? styles.spaceKey : null
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function EditTransactionModal({
  form,
  onCancel,
  onChange,
  onSave,
  pendingParse,
  visible
}: {
  form: EditForm;
  onCancel: () => void;
  onChange: (form: EditForm) => void;
  onSave: () => void;
  pendingParse?: ParseResult;
  visible: boolean;
}) {
  const category = categoryOptions.find((item) => item.value === form.category) ?? categoryOptions[0];
  const isExpense = form.type !== "income";

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <Pressable onPress={onCancel} style={styles.modalScrim} />
        <View style={styles.editSheet}>
          <View style={styles.sheetHandleWrap}>
            <View style={styles.sheetHandle} />
          </View>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Edit {isExpense ? "Expense" : "Income"}</Text>
            <Pressable onPress={onCancel} style={styles.sheetClose}>
              <Ionicons name="close-outline" size={20} color={theme.text} />
            </Pressable>
          </View>
          <View style={styles.sheetDivider} />

          <ScrollView
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.sheetScroll}
          >
            <View style={styles.typeToggle}>
              {["expense", "income"].map((type) => (
                <Pressable
                  key={type}
                  onPress={() => onChange({ ...form, type })}
                  style={[styles.typePill, form.type === type && styles.typePillActive]}
                >
                  <Text style={[styles.typeText, form.type === type && styles.typeTextActive]}>
                    {titleCase(type)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Amount</Text>
              <View style={styles.amountField}>
                <Text style={styles.amountPrefix}>Rs</Text>
                <TextInput
                  keyboardType="numeric"
                  onChangeText={(amount) => onChange({ ...form, amount })}
                  placeholder="0"
                  placeholderTextColor={theme.muted}
                  style={styles.amountInput}
                  value={form.amount}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categorySelect}>
                <View style={styles.categorySelectedLeft}>
                  <Ionicons name={category.icon} size={20} color={theme.text} />
                  <Text style={styles.categorySelectedText}>{category.label}</Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={theme.muted} />
              </View>
              <View style={styles.categoryGrid}>
                {categoryOptions.map((item) => {
                  const active = form.category === item.value;
                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => onChange({ ...form, category: item.value })}
                      style={[styles.categoryChip, active && styles.categoryChipActive]}
                    >
                      <Ionicons name={item.icon} size={14} color={active ? theme.text : theme.muted} />
                      <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Merchant / Note</Text>
              <TextInput
                onChangeText={(note) => onChange({ ...form, note })}
                placeholder="Add merchant or note"
                placeholderTextColor={theme.muted}
                style={styles.noteInput}
                value={form.note}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Date</Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={20} color={theme.muted} />
                <Text style={styles.dateText}>{dateDisplay(form.dateLabel, pendingParse?.timestamp)}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.muted} />
              </View>
              <View style={styles.inlineChoices}>
                {dateOptions.map((item) => (
                  <Pressable
                    key={item.label}
                    onPress={() => onChange({ ...form, dateLabel: item.label })}
                    style={[styles.smallChoice, form.dateLabel === item.label && styles.smallChoiceActive]}
                  >
                    <Text
                      style={[
                        styles.smallChoiceText,
                        form.dateLabel === item.label && styles.smallChoiceTextActive
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Payment Method</Text>
              <View style={styles.paymentRow}>
                <Ionicons name="card-outline" size={20} color={theme.muted} />
                <View style={styles.paymentChips}>
                  {paymentMethods.map((method) => (
                    <Pressable
                      key={method}
                      onPress={() => onChange({ ...form, paymentMethod: method })}
                      style={[styles.paymentChip, form.paymentMethod === method && styles.paymentChipActive]}
                    >
                      <Text
                        style={[
                          styles.paymentText,
                          form.paymentMethod === method && styles.paymentTextActive
                        ]}
                      >
                        {method}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.sheetActions}>
            <Pressable onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onSave} style={styles.saveButton}>
              <Text style={styles.saveText}>Save Changes</Text>
            </Pressable>
          </View>
          <View style={styles.sheetHomeIndicator} />
        </View>
      </View>
    </Modal>
  );
}

function buildEditForm(parse?: ParseResult): EditForm {
  return {
    amount: parse?.amount ? String(Math.round(parse.amount)) : "",
    category: normalizeCategory(parse?.category ?? "food"),
    dateLabel: "Today",
    note: parse?.vendor || parse?.originalText || "",
    paymentMethod: parse?.paymentMethod ?? "UPI",
    type: parse?.type ?? "expense"
  };
}

function normalizeCategory(category: string) {
  const clean = category.toLowerCase();
  if (clean.includes("dining")) return "food";
  if (clean.includes("grocery")) return "groceries";
  if (categoryOptions.some((item) => item.value === clean)) return clean;
  return clean.includes("salary") ? "salary" : "other";
}

function dateForOption(label: string) {
  const option = dateOptions.find((item) => item.label === label);
  const date = new Date();
  date.setDate(date.getDate() + (option?.offset ?? 0));
  return date;
}

function dateDisplay(label: string, timestamp?: string) {
  const date = label === "Custom" && timestamp ? new Date(timestamp) : dateForOption(label);
  const formatted = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
  return `${label}, ${formatted}`;
}

function titleCase(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "center",
    backgroundColor: theme.bg,
    flex: 1,
    maxWidth: 402,
    width: "100%"
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
  topBar: {
    alignItems: "center",
    borderBottomColor: theme.text,
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 68,
    justifyContent: "space-between",
    paddingHorizontal: 24
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  titleEmoji: {
    fontSize: 20,
    lineHeight: 25
  },
  title: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 25
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  messages: {
    gap: 44,
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  bubble: {
    borderRadius: 18,
    maxWidth: 300,
    paddingHorizontal: 16,
    paddingVertical: 15
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: theme.surface
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: theme.brand,
    borderBottomRightRadius: 8
  },
  bubbleText: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24
  },
  assistantText: {
    color: theme.text
  },
  userText: {
    color: theme.text
  },
  confirmBubble: {
    alignSelf: "flex-start",
    backgroundColor: theme.surface,
    borderRadius: 18,
    marginBottom: 20,
    marginHorizontal: 24,
    maxWidth: 300,
    padding: 16
  },
  confirmText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24
  },
  confirmActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  smsPanel: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
    marginHorizontal: 24,
    padding: 14
  },
  smsPanelTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "900"
  },
  smsCard: {
    backgroundColor: theme.surfaceSoft,
    borderRadius: 14,
    gap: 6,
    padding: 12
  },
  smsCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  smsAmount: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900"
  },
  smsType: {
    color: theme.success,
    fontSize: 12,
    fontWeight: "900"
  },
  smsMeta: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "700"
  },
  smsCategory: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  smsActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 4
  },
  saveChip: {
    backgroundColor: theme.brand,
    borderRadius: 17,
    height: 33,
    justifyContent: "center",
    paddingHorizontal: 16
  },
  saveChipText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "900"
  },
  editChip: {
    backgroundColor: theme.surfaceSoft,
    borderRadius: 17,
    height: 33,
    justifyContent: "center",
    paddingHorizontal: 16
  },
  editChipText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "900"
  },
  ignoreChip: {
    backgroundColor: theme.field,
    borderRadius: 17,
    height: 33,
    justifyContent: "center",
    paddingHorizontal: 16
  },
  ignoreChipText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  disabledChip: {
    opacity: 0.55
  },
  pressed: {
    opacity: 0.8
  },
  followUp: {
    borderTopColor: theme.text,
    borderTopWidth: 1,
    marginTop: 4,
    paddingHorizontal: 24,
    paddingTop: 16
  },
  followUpText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 19
  },
  followUpActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  secondaryChip: {
    backgroundColor: theme.surface,
    borderRadius: 17,
    height: 33,
    justifyContent: "center",
    paddingHorizontal: 16
  },
  secondaryChipText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "800"
  },
  inputPanel: {
    backgroundColor: theme.bg
  },
  inputBar: {
    alignItems: "center",
    borderTopColor: theme.text,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
    height: 84,
    paddingHorizontal: 20
  },
  input: {
    backgroundColor: theme.surface,
    borderRadius: 22,
    color: theme.text,
    flex: 1,
    fontSize: 16,
    height: 43,
    paddingHorizontal: 16
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  keyboard: {
    backgroundColor: theme.keyboard,
    gap: 10,
    height: 220,
    paddingHorizontal: 12,
    paddingTop: 12
  },
  keyRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center"
  },
  key: {
    backgroundColor: theme.dim,
    borderRadius: 5,
    height: 42,
    width: 32
  },
  spaceKey: {
    width: 120
  },
  homeIndicator: {
    alignSelf: "center",
    backgroundColor: theme.indicator,
    borderRadius: 3,
    height: 5,
    marginBottom: 14,
    marginTop: 14,
    opacity: 0.7,
    width: 134
  },
  modalOverlay: {
    backgroundColor: theme.overlay,
    flex: 1,
    justifyContent: "flex-end"
  },
  modalScrim: {
    ...StyleSheet.absoluteFillObject
  },
  editSheet: {
    alignSelf: "center",
    backgroundColor: theme.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "93%",
    overflow: "hidden",
    width: "100%",
    maxWidth: 402
  },
  sheetHandleWrap: {
    alignItems: "center",
    height: 16,
    justifyContent: "flex-end"
  },
  sheetHandle: {
    backgroundColor: theme.dim,
    borderRadius: 2,
    height: 4,
    width: 40
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    height: 74,
    justifyContent: "space-between",
    paddingHorizontal: 24
  },
  sheetTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28
  },
  sheetClose: {
    alignItems: "center",
    backgroundColor: theme.field,
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  sheetDivider: {
    backgroundColor: theme.text,
    height: 1,
    opacity: 0.08
  },
  sheetScroll: {
    maxHeight: 626
  },
  sheetContent: {
    gap: 24,
    padding: 24
  },
  typeToggle: {
    backgroundColor: theme.field,
    borderRadius: 18,
    flexDirection: "row",
    gap: 6,
    padding: 4
  },
  typePill: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    height: 34,
    justifyContent: "center"
  },
  typePillActive: {
    backgroundColor: theme.brand
  },
  typeText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  typeTextActive: {
    color: theme.text
  },
  fieldGroup: {
    gap: 8
  },
  fieldLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 14
  },
  amountField: {
    alignItems: "center",
    backgroundColor: theme.field,
    borderColor: theme.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    height: 72,
    paddingHorizontal: 16
  },
  amountPrefix: {
    color: theme.text,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 35,
    marginRight: 8
  },
  amountInput: {
    color: theme.text,
    flex: 1,
    fontSize: 34,
    fontWeight: "900",
    height: 56
  },
  categorySelect: {
    alignItems: "center",
    backgroundColor: theme.field,
    borderColor: theme.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    height: 52,
    justifyContent: "space-between",
    paddingHorizontal: 16
  },
  categorySelectedLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  categorySelectedText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "800"
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 4
  },
  categoryChip: {
    alignItems: "center",
    backgroundColor: theme.field,
    borderColor: "transparent",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    height: 32,
    paddingHorizontal: 12
  },
  categoryChipActive: {
    backgroundColor: theme.brand,
    borderColor: theme.brand
  },
  categoryChipText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  categoryChipTextActive: {
    color: theme.text
  },
  noteInput: {
    backgroundColor: theme.field,
    borderColor: theme.border,
    borderRadius: 14,
    borderWidth: 1,
    color: theme.text,
    fontSize: 16,
    fontWeight: "600",
    height: 51,
    paddingHorizontal: 16
  },
  dateRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    height: 28
  },
  dateText: {
    color: theme.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "700"
  },
  inlineChoices: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 2
  },
  smallChoice: {
    backgroundColor: theme.field,
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    paddingHorizontal: 14
  },
  smallChoiceActive: {
    backgroundColor: theme.brand
  },
  smallChoiceText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  smallChoiceTextActive: {
    color: theme.text
  },
  paymentRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  paymentChips: {
    flexDirection: "row",
    gap: 8
  },
  paymentChip: {
    backgroundColor: theme.field,
    borderRadius: 17,
    height: 33,
    justifyContent: "center",
    paddingHorizontal: 16
  },
  paymentChipActive: {
    backgroundColor: theme.brand
  },
  paymentText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  paymentTextActive: {
    color: theme.text
  },
  sheetActions: {
    borderTopColor: theme.text,
    borderTopWidth: 1,
    borderTopLeftRadius: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  cancelButton: {
    alignItems: "center",
    backgroundColor: theme.field,
    borderRadius: 16,
    height: 51,
    justifyContent: "center",
    width: 120
  },
  cancelText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900"
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderRadius: 16,
    flex: 1,
    height: 51,
    justifyContent: "center"
  },
  saveText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900"
  },
  sheetHomeIndicator: {
    alignSelf: "center",
    backgroundColor: theme.indicator,
    borderRadius: 3,
    height: 5,
    marginBottom: 14,
    marginTop: 14,
    opacity: 0.7,
    width: 134
  }
});
