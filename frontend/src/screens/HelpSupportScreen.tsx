import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const theme = {
  bg: "#121212",
  surface: "#1C1C2A",
  surfaceSoft: "#242436",
  border: "#3F3F46",
  brand: "#FF5533",
  text: "#FFFFFF",
  secondary: "#A1A1AA",
  muted: "#71717A",
  divider: "#FFFFFF"
};

type HelpSupportScreenProps = {
  onBack: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenTermsOfService?: () => void;
};

const faqs = [
  {
    id: "add-expense",
    question: "How do I add an expense?",
    answer:
      'Tap the large coral "+" button in the center of the bottom navigation bar to quickly add an expense.'
  },
  {
    id: "budget",
    question: "How does the budget work?",
    answer:
      "Budgets compare your spending against the limits you set for each category and show progress as you spend."
  },
  {
    id: "linked-accounts",
    question: "Can I link multiple bank accounts?",
    answer:
      "Yes. The Linked Accounts screen is designed to support multiple bank and payment sources once account sync is connected."
  },
  {
    id: "savings-goal",
    question: "How is my savings goal calculated?",
    answer:
      "Savings progress compares your available balance against the monthly savings goal collected during setup."
  },
  {
    id: "delete-account",
    question: "How do I delete my account?",
    answer:
      "Account deletion is not available in this app build yet. Contact support for account-related requests."
  }
];

const contactRows = [
  { id: "chat-support", title: "Chat with Support", icon: "chatbubble-ellipses-outline" },
  { id: "email", title: "Email Us", icon: "mail-outline" }
] as const;

const resourceRows = [
  { id: "privacy", title: "Privacy Policy" },
  { id: "terms", title: "Terms of Service" }
] as const;

export function HelpSupportScreen({
  onBack,
  onOpenPrivacyPolicy,
  onOpenTermsOfService
}: HelpSupportScreenProps) {
  const [query, setQuery] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState("add-expense");

  const cleanQuery = query.trim().toLowerCase();
  const filteredFaqs = useMemo(() => {
    if (!cleanQuery) return faqs;
    return faqs.filter(
      (item) =>
        item.question.toLowerCase().includes(cleanQuery) ||
        item.answer.toLowerCase().includes(cleanQuery)
    );
  }, [cleanQuery]);
  const filteredContactRows = useMemo(() => {
    if (!cleanQuery) return [...contactRows];
    return contactRows.filter((item) => item.title.toLowerCase().includes(cleanQuery));
  }, [cleanQuery]);
  const filteredResourceRows = useMemo(() => {
    if (!cleanQuery) return [...resourceRows];
    return resourceRows.filter((item) => item.title.toLowerCase().includes(cleanQuery));
  }, [cleanQuery]);
  const hasResults =
    filteredFaqs.length || filteredContactRows.length || filteredResourceRows.length;

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FakeStatusBar />

        <View style={styles.header}>
          <Pressable onPress={onBack} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.headerIcon} />
        </View>

        <View style={styles.content}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={theme.muted} />
            <TextInput
              autoCapitalize="none"
              onChangeText={setQuery}
              placeholder="Search for help..."
              placeholderTextColor={theme.muted}
              selectionColor={theme.brand}
              style={styles.searchInput}
              value={query}
            />
          </View>

          {filteredFaqs.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
              <View style={styles.stack}>
                {filteredFaqs.map((faq) => (
                  <FaqRow
                    expanded={expandedFaqId === faq.id}
                    faq={faq}
                    key={faq.id}
                    onPress={() => setExpandedFaqId(expandedFaqId === faq.id ? "" : faq.id)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {filteredContactRows.length ? (
            <SupportSection title="Contact Us">
              {filteredContactRows.map((item, index) => (
                <View key={item.id}>
                  <SupportRow icon={item.icon} title={item.title} />
                  {index < filteredContactRows.length - 1 ? <View style={styles.rowDivider} /> : null}
                </View>
              ))}
            </SupportSection>
          ) : null}

          {filteredResourceRows.length ? (
            <SupportSection title="Resources">
              {filteredResourceRows.map((item, index) => (
                <View key={item.id}>
                  <SupportRow
                    onPress={
                      item.id === "privacy"
                        ? onOpenPrivacyPolicy
                        : item.id === "terms"
                          ? onOpenTermsOfService
                          : undefined
                    }
                    title={item.title}
                  />
                  {index < filteredResourceRows.length - 1 ? <View style={styles.rowDivider} /> : null}
                </View>
              ))}
            </SupportSection>
          ) : null}

          {!hasResults ? <Text style={styles.emptyText}>No help topics found</Text> : null}
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

function FaqRow({
  expanded,
  faq,
  onPress
}: {
  expanded: boolean;
  faq: (typeof faqs)[number];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.faqCard, expanded && styles.faqCardExpanded, pressed && styles.pressed]}
    >
      <View style={styles.faqQuestionRow}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={theme.muted} />
      </View>
      {expanded ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}
    </Pressable>
  );
}

function SupportSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function SupportRow({
  icon,
  onPress,
  title
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  title: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.supportRow, pressed && styles.pressed]}
    >
      <View style={styles.supportLeft}>
        {icon ? (
          <View style={styles.supportIcon}>
            <Ionicons name={icon} size={20} color={theme.secondary} />
          </View>
        ) : null}
        <Text style={styles.supportTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.muted} />
    </Pressable>
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
    minHeight: 997,
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
    gap: 24,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    height: 44,
    paddingHorizontal: 12
  },
  searchInput: {
    color: theme.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    height: 44,
    padding: 0
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
  stack: {
    gap: 12
  },
  faqCard: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    minHeight: 60,
    overflow: "hidden",
    paddingHorizontal: 18
  },
  faqCardExpanded: {
    paddingBottom: 18
  },
  faqQuestionRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 60
  },
  faqQuestion: {
    color: theme.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 21,
    paddingRight: 12
  },
  faqAnswer: {
    color: theme.secondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    overflow: "hidden"
  },
  supportRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 60,
    justifyContent: "space-between",
    paddingHorizontal: 18
  },
  supportLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12
  },
  supportIcon: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 24
  },
  supportTitle: {
    color: theme.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 21
  },
  rowDivider: {
    backgroundColor: theme.divider,
    height: 1,
    marginLeft: 54,
    opacity: 0.08
  },
  emptyText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 24,
    textAlign: "center"
  },
  pressed: {
    opacity: 0.78
  }
});
