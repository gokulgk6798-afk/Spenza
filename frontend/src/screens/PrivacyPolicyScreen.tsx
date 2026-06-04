import { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const theme = {
  bg: "#121212",
  surface: "#1C1C2A",
  brand: "#FF5533",
  text: "#FFFFFF",
  secondary: "#A1A1AA",
  muted: "#71717A"
};

type PrivacyPolicyScreenProps = {
  onBack: () => void;
};

const policySections = [
  {
    id: "data-collection",
    title: "Data Collection",
    body:
      "We collect information you provide directly to us, such as when you create an account, link bank accounts, or contact support. This includes contact details, financial data, and transaction history."
  },
  {
    id: "data-use",
    title: "How We Use Your Data",
    body:
      "We use your data to provide budgeting, expense tracking, insights, account support, security monitoring, and app improvements."
  },
  {
    id: "data-sharing",
    title: "Data Sharing",
    body:
      "We do not sell personal financial data. Information is shared only with service providers or partners needed to operate the app and protect your account."
  },
  {
    id: "cookies",
    title: "Cookies & Tracking",
    body:
      "We may use basic analytics and device identifiers to understand app usage, remember preferences, and improve reliability."
  },
  {
    id: "rights",
    title: "Your Rights",
    body:
      "You can request access, correction, export, or deletion of your personal data where supported by applicable law and product capabilities."
  },
  {
    id: "contact",
    title: "Contact Us",
    body:
      "For privacy questions or data requests, contact the support team from the Help & Support screen."
  }
];

export function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
  const [expandedSectionId, setExpandedSectionId] = useState("data-collection");

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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.headerIcon} />
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <SectionKicker>Policy Overview</SectionKicker>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewText}>
                Last Updated: Oct 24, 2023. Spenzaa is committed to protecting your privacy and
                ensuring your financial data is handled with the highest security standards.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <SectionKicker>Detailed Sections</SectionKicker>
            <View style={styles.accordionStack}>
              {policySections.map((section) => (
                <PolicyAccordion
                  expanded={expandedSectionId === section.id}
                  key={section.id}
                  onPress={() =>
                    setExpandedSectionId(expandedSectionId === section.id ? "" : section.id)
                  }
                  section={section}
                />
              ))}
            </View>
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

function SectionKicker({ children }: { children: string }) {
  return <Text style={styles.sectionKicker}>{children}</Text>;
}

function PolicyAccordion({
  expanded,
  onPress,
  section
}: {
  expanded: boolean;
  onPress: () => void;
  section: (typeof policySections)[number];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.accordionCard,
        expanded && styles.accordionCardExpanded,
        pressed && styles.pressed
      ]}
    >
      <View style={styles.accordionHeader}>
        <Text style={styles.accordionTitle}>{section.title}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={theme.muted} />
      </View>
      {expanded ? <Text style={styles.accordionBody}>{section.body}</Text> : null}
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
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
    marginLeft: 16
  },
  content: {
    gap: 24,
    padding: 24
  },
  section: {
    gap: 12
  },
  sectionKicker: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 14,
    paddingBottom: 4,
    textTransform: "uppercase"
  },
  overviewCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 18
  },
  overviewText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21
  },
  accordionStack: {
    gap: 12
  },
  accordionCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    minHeight: 56,
    overflow: "hidden",
    paddingHorizontal: 18
  },
  accordionCardExpanded: {
    paddingBottom: 18
  },
  accordionHeader: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 56
  },
  accordionTitle: {
    color: theme.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 21,
    paddingRight: 12
  },
  accordionBody: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21
  },
  pressed: {
    opacity: 0.78
  }
});
