import { PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, shadow } from "../constants/theme";

export function Card({
  children,
  style
}: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  variant = "filled"
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "filled" | "outline";
}) {
  const filled = variant === "filled";
  const blocked = Boolean(disabled || loading);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: Boolean(loading) }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        filled ? styles.filledButton : styles.outlineButton,
        pressed && styles.pressed,
        blocked && styles.disabled
      ]}
    >
      {loading ? (
        <ActivityIndicator color={filled ? colors.surface : colors.primaryBlue} />
      ) : (
        <Text style={[styles.buttonText, filled ? styles.filledText : styles.outlineText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function IconButton({
  name,
  onPress,
  showDot
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  showDot?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.iconButton}>
      <Ionicons name={name} size={18} color={colors.secondaryText} />
      {showDot ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

export function MoneyText({ value, compact }: { value: number; compact?: boolean }) {
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard"
  }).format(value);
  return <Text>Rs {formatted}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    ...shadow
  },
  button: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16
  },
  filledButton: {
    backgroundColor: colors.primaryBlue
  },
  outlineButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "800"
  },
  filledText: {
    color: colors.surface
  },
  outlineText: {
    color: colors.deepNavy
  },
  pressed: {
    opacity: 0.82
  },
  disabled: {
    opacity: 0.65
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    position: "relative",
    width: 36
  },
  dot: {
    backgroundColor: colors.danger,
    borderColor: colors.surface,
    borderRadius: 4,
    borderWidth: 1,
    height: 8,
    position: "absolute",
    right: 5,
    top: 5,
    width: 8
  }
});
