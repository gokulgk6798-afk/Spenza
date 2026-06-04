import { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
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

type ThemeScreenProps = {
  onBack: () => void;
};

const themeOptions = [
  {
    id: "dark",
    icon: "moon-outline",
    title: "Dark Mode",
    subtitle: "Currently active"
  },
  {
    id: "light",
    icon: "sunny-outline",
    title: "Light Mode",
    subtitle: "Warm cream & coral"
  },
  {
    id: "system",
    icon: "phone-portrait-outline",
    title: "Follow System",
    subtitle: "Matches your device setting"
  }
] as const;

const accentColors = ["#FF5533", "#10B981", "#38BDF8", "#8B5CF6", "#F59E0B", "#EF4444"];
const fontSizes = ["Small", "Medium", "Large"] as const;

export function ThemeScreen({ onBack }: ThemeScreenProps) {
  const { profile, savePreferences, user } = useApp();
  const currentPreferences = profile.data?.preferences || user?.preferences;
  const [selectedTheme, setSelectedTheme] = useState(currentPreferences?.theme || "dark");
  const [selectedAccent, setSelectedAccent] = useState(
    currentPreferences?.accentColor || accentColors[0]
  );
  const [selectedFontSize, setSelectedFontSize] = useState(
    currentPreferences?.fontSize || "Medium"
  );

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
          <Text style={styles.headerTitle}>Appearance</Text>
          <View style={styles.headerIcon} />
        </View>

        <View style={styles.content}>
          <View style={styles.themeBlock}>
            <Text style={styles.helper}>Choose your app theme</Text>
            <View style={styles.themeOptions}>
              {themeOptions.map((item, index) => (
                <View key={item.id}>
                  <Pressable
                    onPress={() => {
                      setSelectedTheme(item.id);
                      void savePreferences({ theme: item.id });
                    }}
                    style={({ pressed }) => [
                      styles.themeRow,
                      selectedTheme === item.id && styles.themeRowActive,
                      pressed && styles.pressed
                    ]}
                  >
                    <View style={styles.themeLeft}>
                      <Ionicons
                        name={item.icon}
                        size={24}
                        color={selectedTheme === item.id ? theme.brand : theme.secondary}
                      />
                      <View>
                        <Text style={styles.themeTitle}>{item.title}</Text>
                        <Text style={styles.themeSubtitle}>
                          {selectedTheme === item.id && item.id !== "dark" ? "Currently active" : item.subtitle}
                        </Text>
                      </View>
                    </View>
                    {selectedTheme === item.id ? (
                      <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={14} color={theme.text} />
                      </View>
                    ) : null}
                  </Pressable>
                  {index < themeOptions.length - 1 ? <View style={styles.themeGap} /> : null}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionKicker}>Accent Color</Text>
            <View style={styles.swatches}>
              {accentColors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => {
                    setSelectedAccent(color);
                    void savePreferences({ accentColor: color });
                  }}
                  style={({ pressed }) => [
                    styles.swatch,
                    { backgroundColor: color },
                    selectedAccent === color && styles.swatchActive,
                    pressed && styles.pressed
                  ]}
                >
                  {selectedAccent === color ? (
                    <Ionicons name="checkmark" size={18} color={theme.text} />
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionKicker}>Font Size</Text>
            <View style={styles.fontChoices}>
              {fontSizes.map((size) => (
                <Pressable
                  key={size}
                  onPress={() => {
                    setSelectedFontSize(size);
                    void savePreferences({ fontSize: size });
                  }}
                  style={({ pressed }) => [
                    styles.fontChip,
                    selectedFontSize === size && styles.fontChipActive,
                    pressed && styles.pressed
                  ]}
                >
                  <Text
                    style={[
                      styles.fontChipText,
                      selectedFontSize === size && styles.fontChipTextActive
                    ]}
                  >
                    {size}
                  </Text>
                </Pressable>
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
    gap: 32,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  themeBlock: {
    gap: 12
  },
  helper: {
    color: theme.secondary,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  },
  themeOptions: {
    gap: 16
  },
  themeRow: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderColor: "transparent",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    height: 78,
    justifyContent: "space-between",
    paddingHorizontal: 18
  },
  themeRowActive: {
    borderColor: theme.brand
  },
  themeLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16
  },
  themeTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 24
  },
  themeSubtitle: {
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
  themeGap: {
    height: 0
  },
  section: {
    gap: 16
  },
  sectionKicker: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 13,
    textTransform: "uppercase"
  },
  swatches: {
    flexDirection: "row",
    gap: 16
  },
  swatch: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 18,
    borderWidth: 2,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  swatchActive: {
    borderColor: theme.text
  },
  fontChoices: {
    flexDirection: "row",
    gap: 12
  },
  fontChip: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderColor: "transparent",
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    paddingHorizontal: 16
  },
  fontChipActive: {
    backgroundColor: theme.brand,
    borderColor: theme.brand
  },
  fontChipText: {
    color: theme.secondary,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20
  },
  fontChipTextActive: {
    color: theme.text
  },
  pressed: {
    opacity: 0.78
  }
});
