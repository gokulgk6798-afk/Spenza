import { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const theme = {
  bg: "#121212",
  surface: "#1C1C2A",
  text: "#FFFFFF",
  muted: "#71717A"
};

type TermsOfServiceScreenProps = {
  onBack: () => void;
};

const agreementSections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    body:
      "By accessing or using the Spenzaa app, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, you are prohibited from using the app."
  },
  {
    id: "use",
    title: "Use of the Service",
    body:
      "You may use Spenzaa for personal finance tracking, budgeting, and insights in accordance with these terms and applicable laws."
  },
  {
    id: "account",
    title: "Account Responsibilities",
    body:
      "You are responsible for maintaining accurate account information, protecting access to your device, and reviewing activity connected to your account."
  },
  {
    id: "prohibited",
    title: "Prohibited Activities",
    body:
      "You must not misuse the service, attempt unauthorized access, interfere with app operations, or use Spenzaa for unlawful activity."
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    body:
      "Spenzaa, including its design, content, features, and software, is protected by intellectual property rights and may not be copied without permission."
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    body:
      "Spenzaa provides financial tools for organization and insight. It is not a substitute for professional financial, legal, or tax advice."
  },
  {
    id: "changes",
    title: "Changes to Terms",
    body:
      "We may update these terms as the product evolves. Continued use of the app after updates means you accept the revised terms."
  },
  {
    id: "contact",
    title: "Contact Us",
    body:
      "For questions about these terms, contact the support team from the Help & Support screen."
  }
];

export function TermsOfServiceScreen({ onBack }: TermsOfServiceScreenProps) {
  const [expandedSectionId, setExpandedSectionId] = useState("acceptance");

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
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={styles.headerIcon} />
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <SectionKicker>Introduction</SectionKicker>
            <View style={styles.introCard}>
              <Text style={styles.introText}>
                Please read these terms carefully before using our platform. These terms govern your
                access to and use of Spenzaa&apos;s financial tools and services.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <SectionKicker>Agreement Details</SectionKicker>
            <View style={styles.accordionStack}>
              {agreementSections.map((section) => (
                <AgreementAccordion
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

function AgreementAccordion({
  expanded,
  onPress,
  section
}: {
  expanded: boolean;
  onPress: () => void;
  section: (typeof agreementSections)[number];
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
  introCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 18
  },
  introText: {
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
