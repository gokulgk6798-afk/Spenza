import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
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

const theme = {
  bg: "#121212",
  surface: "#1C1C2A",
  surfaceSoft: "#242436",
  border: "#3F3F46",
  brand: "#FF5533",
  text: "#FFFFFF",
  muted: "#71717A",
  secondary: "#A1A1AA"
};

type ProfileEditScreenProps = {
  onBack: () => void;
};

export function ProfileEditScreen({ onBack }: ProfileEditScreenProps) {
  const { profile, saveProfile, user } = useApp();
  const fallbackName = profile.data?.displayName?.trim() || user?.displayName?.trim() || "Priya Sharma";
  const [fullName, setFullName] = useState(fallbackName);
  const [phone, setPhone] = useState(profile.data?.phone || "+91 98765 43210");
  const [email, setEmail] = useState(profile.data?.email || user?.email || "priya@email.com");
  const [dob, setDob] = useState(profile.data?.dateOfBirth || "12 Mar 1995");
  const [gender, setGender] = useState(profile.data?.gender || "Female");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const initials = useMemo(() => getInitials(fullName), [fullName]);

  async function saveChanges() {
    if (!fullName.trim() || !email.trim()) {
      setError("Full name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveProfile({
        displayName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth: dob.trim(),
        gender: gender.trim()
      });
      onBack();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
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
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerIcon} />
        </View>

        <View style={styles.content}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarStack}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Pressable style={styles.cameraBadge}>
                <Ionicons name="camera-outline" size={16} color={theme.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.form}>
            <ProfileField label="Full Name" onChangeText={setFullName} value={fullName} />
            <ProfileField
              keyboardType="phone-pad"
              label="Phone"
              onChangeText={setPhone}
              value={phone}
            />
            <ProfileField
              autoCapitalize="none"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              value={email}
            />
            <ProfileField
              icon="calendar-outline"
              label="Date of Birth"
              onChangeText={setDob}
              value={dob}
            />
            <ProfileField
              icon="chevron-down"
              label="Gender"
              onChangeText={setGender}
              value={gender}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={saveChanges} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
          <Text style={styles.saveText}>{saving ? "Saving..." : "Save Changes"}</Text>
        </Pressable>
      </View>
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

function ProfileField({
  autoCapitalize,
  icon,
  keyboardType,
  label,
  onChangeText,
  value
}: {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  icon?: keyof typeof Ionicons.glyphMap;
  keyboardType?: "default" | "email-address" | "phone-pad";
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputBox}>
        <TextInput
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholderTextColor={theme.muted}
          selectionColor={theme.brand}
          style={styles.input}
          value={value}
        />
        {icon ? <Ionicons name={icon} size={20} color={theme.muted} /> : null}
      </View>
    </View>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "PS";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
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
    paddingBottom: 128,
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
    paddingTop: 24
  },
  avatarSection: {
    alignItems: "center",
    height: 100
  },
  avatarStack: {
    height: 100,
    position: "relative",
    width: 100
  },
  avatar: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderColor: theme.surfaceSoft,
    borderRadius: 50,
    borderWidth: 3,
    height: 100,
    justifyContent: "center",
    width: 100
  },
  avatarText: {
    color: theme.text,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 32
  },
  cameraBadge: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderColor: theme.bg,
    borderRadius: 16,
    borderWidth: 3,
    bottom: 0,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 32
  },
  form: {
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 32
  },
  fieldWrap: {
    gap: 8
  },
  fieldLabel: {
    color: theme.secondary,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20
  },
  inputBox: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    height: 52,
    paddingHorizontal: 16
  },
  input: {
    color: theme.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    height: 52,
    lineHeight: 24,
    padding: 0
  },
  footer: {
    backgroundColor: theme.bg,
    borderTopColor: "rgba(255,255,255,0.08)",
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    position: "absolute",
    right: 0
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderRadius: 18,
    height: 56,
    justifyContent: "center"
  },
  saveText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 24
  },
  errorText: {
    color: theme.brand,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  },
  pressed: {
    opacity: 0.78
  }
});
