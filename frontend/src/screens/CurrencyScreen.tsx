import { useMemo, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";

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

type CurrencyScreenProps = {
  onBack: () => void;
};

const popularCurrencies = [
  { code: "INR", name: "Indian Rupee", icon: "flag-outline" }
] as const;

const otherCurrencies = [
  { code: "USD", name: "US Dollar", icon: "earth-outline" },
  { code: "GBP", name: "British Pound", icon: "earth-outline" },
  { code: "EUR", name: "Euro", icon: "globe-outline" },
  { code: "SGD", name: "Singapore Dollar", icon: "globe-outline" },
  { code: "AED", name: "UAE Dirham", icon: "flag-outline" },
  { code: "JPY", name: "Japanese Yen", icon: "flag-outline" }
] as const;

type CurrencyItem = (typeof popularCurrencies)[number] | (typeof otherCurrencies)[number];

export function CurrencyScreen({ onBack }: CurrencyScreenProps) {
  const { profile, savePreferences, user } = useApp();
  const [selectedCode, setSelectedCode] = useState(
    profile.data?.preferences.currency || user?.preferences?.currency || "INR"
  );
  const [query, setQuery] = useState("");
  const filteredPopular = useFilteredCurrencies(popularCurrencies, query);
  const filteredOther = useFilteredCurrencies(otherCurrencies, query);

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
          <Text style={styles.headerTitle}>Currency</Text>
          <View style={styles.headerIcon} />
        </View>

        <View style={styles.content}>
          <Text style={styles.helper}>Select your default display currency</Text>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={theme.muted} />
            <TextInput
              autoCapitalize="characters"
              onChangeText={setQuery}
              placeholder="Search currency..."
              placeholderTextColor={theme.muted}
              selectionColor={theme.brand}
              style={styles.searchInput}
              value={query}
            />
          </View>

          {filteredPopular.length ? (
            <CurrencySection
              currencies={filteredPopular}
              selectedCode={selectedCode}
              title="Popular"
              onSelect={(code) => {
                setSelectedCode(code);
                void savePreferences({ currency: code });
              }}
            />
          ) : null}

          {filteredOther.length ? (
            <CurrencySection
              currencies={filteredOther}
              selectedCode={selectedCode}
              title="Other Currencies"
              onSelect={(code) => {
                setSelectedCode(code);
                void savePreferences({ currency: code });
              }}
            />
          ) : null}

          {!filteredPopular.length && !filteredOther.length ? (
            <Text style={styles.emptyText}>No currencies found</Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function useFilteredCurrencies<T extends readonly CurrencyItem[]>(currencies: T, query: string) {
  return useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return [...currencies];
    return currencies.filter(
      (item) =>
        item.code.toLowerCase().includes(clean) ||
        item.name.toLowerCase().includes(clean)
    );
  }, [currencies, query]);
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

function CurrencySection({
  currencies,
  onSelect,
  selectedCode,
  title
}: {
  currencies: CurrencyItem[];
  onSelect: (code: string) => void;
  selectedCode: string;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionKicker}>{title}</Text>
      <View style={styles.currencyCard}>
        {currencies.map((currency, index) => (
          <View key={currency.code}>
            <CurrencyRow
              currency={currency}
              onSelect={() => onSelect(currency.code)}
              selected={selectedCode === currency.code}
            />
            {index < currencies.length - 1 ? <View style={styles.rowDivider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function CurrencyRow({
  currency,
  onSelect,
  selected
}: {
  currency: CurrencyItem;
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <Pressable onPress={onSelect} style={({ pressed }) => [styles.currencyRow, pressed && styles.pressed]}>
      <View style={styles.currencyLeft}>
        <View style={styles.currencyIcon}>
          <Ionicons name={currency.icon} size={20} color={theme.text} />
        </View>
        <View>
          <Text style={styles.currencyCode}>{currency.code}</Text>
          <Text style={styles.currencyName}>{currency.name}</Text>
        </View>
      </View>
      {selected ? (
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={15} color={theme.text} />
        </View>
      ) : null}
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
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  helper: {
    color: theme.secondary,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
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
  sectionKicker: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 13,
    textTransform: "uppercase"
  },
  currencyCard: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    overflow: "hidden"
  },
  currencyRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 60,
    justifyContent: "space-between",
    paddingHorizontal: 18
  },
  currencyLeft: {
    alignItems: "center",
    flexDirection: "row"
  },
  currencyIcon: {
    alignItems: "center",
    backgroundColor: theme.surfaceSoft,
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    marginRight: 12,
    width: 32
  },
  currencyCode: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 24
  },
  currencyName: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    marginTop: 2
  },
  checkCircle: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderRadius: 10,
    height: 20,
    justifyContent: "center",
    width: 20
  },
  rowDivider: {
    backgroundColor: theme.divider,
    height: 1,
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
