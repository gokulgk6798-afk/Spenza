import { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";

const theme = {
  background: "#121212",
  brand: "#FF5533",
  card: "#1C1C2A",
  textPrimary: "#FFFFFF",
  textSecondary: "#71717A",
  indicator: "rgba(255, 255, 255, 0.2)"
};

function StatusIcons() {
  return (
    <Svg width={68} height={12} viewBox="0 0 68 12" fill="none">
      <Path
        d="M1 11V9.5M6 11V7M11 11V4.5M16 11V1"
        stroke={theme.textPrimary}
        strokeLinecap="round"
        strokeWidth={2}
      />
      <Path
        d="M24 4.9C27.6 1.6 32.4 1.6 36 4.9M27 7.7C28.8 6.1 31.2 6.1 33 7.7"
        stroke={theme.textPrimary}
        strokeLinecap="round"
        strokeWidth={2}
      />
      <Circle cx={30} cy={10.5} r={1.2} fill={theme.textPrimary} />
      <Rect
        x={45}
        y={1}
        width={18}
        height={10}
        rx={2}
        stroke={theme.textPrimary}
        strokeWidth={2}
      />
      <Path
        d="M66 4.5V7.5"
        stroke={theme.textPrimary}
        strokeLinecap="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

function formatMobileNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function AuthScreen() {
  const { loginWithEmail } = useApp();
  const otpInputRef = useRef<TextInput>(null);
  const [mobileNumber, setMobileNumber] = useState("80981 66798");
  const [authStep, setAuthStep] = useState<
    | "mobile"
    | "otp"
    | "name"
    | "income"
    | "categories"
    | "allocation"
    | "savings"
    | "complete"
  >("mobile");
  const [otp, setOtp] = useState("123456");
  const [fullName, setFullName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("85,000");
  const [incomeSource, setIncomeSource] = useState("Salary");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Food",
    "Transport",
    "Entertainment",
    "Groceries",
    "Medical"
  ]);
  const [categoryAllocations, setCategoryAllocations] = useState<Record<string, number>>({
    Food: 20,
    Transport: 15,
    Entertainment: 10,
    Groceries: 25,
    Medical: 8
  });
  const [savingsGoal, setSavingsGoal] = useState("8,000");
  const [alsoInvest, setAlsoInvest] = useState(true);
  const [investmentAmount, setInvestmentAmount] = useState("3,000");
  const [investmentType, setInvestmentType] = useState("SIP");
  const [error, setError] = useState("");

  function sendOtp() {
    const digits = mobileNumber.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Enter a valid 10 digit mobile number.");
      return;
    }

    setError("");
    setOtp("123456");
    setAuthStep("otp");
  }

  function verifyOtp() {
    if (otp.length !== 6) {
      setError("Enter the 6 digit verification code.");
      return;
    }
    if (otp !== "123456") {
      setError("Use mock OTP 123456 for testing.");
      return;
    }

    setError("");
    setAuthStep("name");
  }

  function completeNameStep() {
    if (fullName.trim().length < 2) {
      setError("Enter your full name to continue.");
      return;
    }

    setError("");
    setAuthStep("income");
  }

  function completeIncomeStep() {
    const incomeDigits = monthlyIncome.replace(/\D/g, "");
    if (!incomeDigits) {
      setError("Enter your monthly income to continue.");
      return;
    }

    setError("");
    setAuthStep("categories");
  }

  function completeCategoriesStep() {
    if (selectedCategories.length === 0) {
      setError("Select at least one spending category.");
      return;
    }

    setError("");
    setCategoryAllocations((current) => {
      const next = { ...current };
      selectedCategories.forEach((category) => {
        if (next[category] === undefined) next[category] = 10;
      });
      return next;
    });
    setAuthStep("allocation");
  }

  function completeAllocationStep() {
    const allocated = selectedCategories.reduce(
      (sum, category) => sum + (categoryAllocations[category] ?? 0),
      0
    );
    if (allocated > 100) {
      setError("Keep allocation within 100%.");
      return;
    }

    setError("");
    setAuthStep("savings");
  }

  function completeSavingsStep() {
    if (!savingsGoal.replace(/\D/g, "")) {
      setError("Enter your monthly savings goal.");
      return;
    }

    setError("");
    setAuthStep("complete");
  }

  async function goToDashboard() {
    await loginWithEmail("mock@spenza.local", "Mock@1234");
  }

  const phoneForDisplay = `+91 ${mobileNumber}`;
  const hasFullName = fullName.trim().length > 0;
  const categoryIcons: Record<string, string> = {
    Food: "🍔",
    Transport: "🚗",
    Shopping: "🛍️",
    Entertainment: "🎬",
    Travel: "✈️",
    Fitness: "💪",
    Groceries: "🛒",
    Medical: "🏥",
    Education: "📚",
    Fuel: "⛽",
    Rent: "🏠",
    Utilities: "💡"
  };
  const allocatedPercent = selectedCategories.reduce(
    (sum, category) => sum + (categoryAllocations[category] ?? 0),
    0
  );
  const incomeValue = Number(monthlyIncome.replace(/\D/g, "")) || 0;
  const savingsRemaining = Math.max(0, Math.round((incomeValue * (100 - allocatedPercent)) / 100));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <StatusBar hidden style="light" backgroundColor={theme.background} />
      <View style={styles.statusBar}>
        <Text style={styles.time}>9:41</Text>
        <View style={styles.icons}>
          <StatusIcons />
        </View>
      </View>

      {authStep === "mobile" ? (
        <>
          <View style={styles.screenContent}>
            <Text style={styles.logo}>Spenzaa</Text>

            <View style={styles.headingGroup}>
              <Text style={styles.title}>Enter your mobile number</Text>
              <Text style={styles.subtitle}>We'll send you a verification code</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.countryBox}>
                <Image
                  resizeMode="cover"
                  source={require("../assets/images/india-flag.png")}
                  style={styles.flag}
                />
                <Text style={styles.countryCode}>+91</Text>
              </View>

              <View style={styles.phoneBox}>
                <TextInput
                  autoFocus
                  keyboardType="number-pad"
                  maxLength={11}
                  onChangeText={(value) => setMobileNumber(formatMobileNumber(value))}
                  selectionColor={theme.brand}
                  style={styles.phoneInput}
                  value={mobileNumber}
                />
              </View>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <View style={styles.footer}>
            <Text style={styles.terms}>
              By continuing you agree to our{" "}
              <Text style={styles.termsLink}>Terms & Privacy Policy</Text>
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={sendOtp}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Send OTP</Text>
            </Pressable>

            <View style={styles.homeIndicator}>
              <View style={styles.indicatorBar} />
            </View>
          </View>
        </>
      ) : authStep === "otp" ? (
        <>
          <View style={styles.otpContent}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setError("");
                setAuthStep("mobile");
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
            </Pressable>

            <View style={styles.headingGroup}>
              <Text style={styles.title}>Verify your number</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to{" "}
                <Text style={styles.subtitleStrong}>{phoneForDisplay}</Text>
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setOtp("");
                requestAnimationFrame(() => otpInputRef.current?.focus());
              }}
              style={styles.otpRow}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const digit = otp[index] ?? "";
                const isActive = index === Math.min(otp.length, 5);
                return (
                  <View key={index} style={[styles.otpBox, isActive && styles.otpBoxActive]}>
                    {digit ? (
                      <Text style={styles.otpDigit}>{digit}</Text>
                    ) : isActive ? (
                      <View style={styles.otpCaret} />
                    ) : null}
                  </View>
                );
              })}
            </Pressable>

            <TextInput
              ref={otpInputRef}
              autoFocus
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
              style={styles.hiddenOtpInput}
              value={otp}
            />

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Resend OTP in</Text>
              <Text style={styles.resendTime}>00:45</Text>
            </View>
            {error ? <Text style={styles.otpError}>{error}</Text> : null}
          </View>

          <View style={styles.otpFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={verifyOtp}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Verify</Text>
            </Pressable>

            <View style={styles.homeIndicator}>
              <View style={styles.indicatorBar} />
            </View>
          </View>
        </>
      ) : authStep === "name" ? (
        <>
          <View style={styles.setupContent}>
            <View style={styles.onboardingHeader}>
              <View style={styles.stepHeaderRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setError("");
                    setAuthStep("otp");
                  }}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </Pressable>
                <Text style={styles.stepText}>Step 1 of 5</Text>
                <View style={styles.headerSpacer} />
              </View>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>

            <View style={styles.namePanel}>
              <View style={styles.userBadge}>
                <Ionicons name="person-outline" size={40} color={theme.textPrimary} />
              </View>

              <View style={styles.centerCopy}>
                <Text style={styles.centerTitle}>What should we call you?</Text>
                <Text
                  style={[
                    styles.centerSubtitle,
                    hasFullName && styles.centerSubtitleSuccess
                  ]}
                >
                  {hasFullName
                    ? "Great name! Tap continue to proceed."
                    : "Your name helps us personalize your app"}
                </Text>
              </View>

              <View
                style={[
                  styles.nameInputBox,
                  hasFullName && styles.nameInputBoxFilled
                ]}
              >
                <TextInput
                  autoCapitalize="words"
                  autoFocus
                  onChangeText={setFullName}
                  placeholder="Your full name"
                  placeholderTextColor={theme.textSecondary}
                  returnKeyType="done"
                  selectionColor={theme.brand}
                  style={styles.nameInput}
                  value={fullName}
                />
              </View>
              {error ? <Text style={styles.nameError}>{error}</Text> : null}
            </View>
          </View>

          <View style={styles.otpFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={completeNameStep}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>

            <View style={styles.homeIndicator}>
              <View style={styles.indicatorBar} />
            </View>
          </View>
        </>
      ) : authStep === "income" ? (
        <>
          <View style={styles.incomeContent}>
            <View style={styles.onboardingHeader}>
              <View style={styles.stepHeaderRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setError("");
                    setAuthStep("name");
                  }}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </Pressable>
                <Text style={styles.stepText}>Step 2 of 5</Text>
                <View style={styles.headerSpacer} />
              </View>
              <View style={styles.progressTrack}>
                <View style={styles.progressFillIncome} />
              </View>
            </View>

            <View style={styles.incomePanel}>
              <View style={styles.userBadge}>
                <Text style={styles.incomeBadgeText}>₹</Text>
              </View>

              <View style={styles.centerCopy}>
                <Text style={styles.centerTitle}>What is your monthly income?</Text>
                <Text style={styles.centerSubtitle}>
                  This helps us personalize your budget
                </Text>
              </View>

              <View style={styles.incomeInputBox}>
                <Text style={styles.incomePrefix}>₹</Text>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={(value) => {
                    const digits = value.replace(/\D/g, "");
                    setMonthlyIncome(
                      digits ? new Intl.NumberFormat("en-IN").format(Number(digits)) : ""
                    );
                  }}
                  selectionColor={theme.brand}
                  style={styles.incomeInput}
                  value={monthlyIncome}
                />
              </View>

              <View style={styles.incomeChips}>
                {["Salary", "Business", "Freelance"].map((source) => {
                  const selected = incomeSource === source;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={source}
                      onPress={() => setIncomeSource(source)}
                      style={[styles.incomeChip, selected && styles.incomeChipSelected]}
                    >
                      <Text style={styles.incomeChipText}>{source}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {error ? <Text style={styles.nameError}>{error}</Text> : null}
            </View>
          </View>

          <View style={styles.otpFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={completeIncomeStep}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>

            <View style={styles.homeIndicator}>
              <View style={styles.indicatorBar} />
            </View>
          </View>
        </>
      ) : authStep === "categories" ? (
        <>
          <View style={styles.categoriesContent}>
            <View style={styles.onboardingHeaderCompact}>
              <View style={styles.stepHeaderRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setError("");
                    setAuthStep("income");
                  }}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </Pressable>
                <Text style={styles.stepText}>Step 3 of 5</Text>
                <View style={styles.headerSpacer} />
              </View>
              <View style={styles.progressTrack}>
                <View style={styles.progressFillCategories} />
              </View>
            </View>

            <View style={styles.categoriesHeading}>
              <Text style={styles.categoriesTitle}>Where do you usually spend?</Text>
              <Text style={styles.categoriesSubtitle}>Select all that apply</Text>
            </View>

            <View style={styles.categoryGrid}>
              {[
                ["Food", "🍔"],
                ["Transport", "🚗"],
                ["Shopping", "🛍️"],
                ["Entertainment", "🎬"],
                ["Travel", "✈️"],
                ["Fitness", "💪"],
                ["Groceries", "🛒"],
                ["Medical", "🏥"],
                ["Education", "📚"],
                ["Fuel", "⛽"],
                ["Rent", "🏠"],
                ["Utilities", "💡"]
              ].map(([label, icon]) => {
                const selected = selectedCategories.includes(label);
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={label}
                    onPress={() => {
                      setError("");
                      setSelectedCategories((current) =>
                        current.includes(label)
                          ? current.filter((item) => item !== label)
                          : [...current, label]
                      );
                    }}
                    style={[
                      styles.categoryTile,
                      selected && styles.categoryTileSelected
                    ]}
                  >
                    <Text style={styles.categoryIcon}>{icon}</Text>
                    <Text
                      style={[
                        styles.categoryLabel,
                        selected && styles.categoryLabelSelected
                      ]}
                    >
                      {label}
                    </Text>
                    {selected && (label === "Groceries" || label === "Medical") ? (
                      <View style={styles.categoryCheck}>
                        <Ionicons name="checkmark" size={10} color={theme.textPrimary} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
            {error ? <Text style={styles.categoryError}>{error}</Text> : null}
          </View>

          <View style={styles.categoriesFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={completeCategoriesStep}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>

            <View style={styles.homeIndicator}>
              <View style={styles.indicatorBar} />
            </View>
          </View>
        </>
      ) : authStep === "allocation" ? (
        <ScrollView
          contentContainerStyle={styles.allocationScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.allocationMain}>
            <View style={styles.allocationHeader}>
              <View style={styles.allocationHeaderRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setError("");
                    setAuthStep("categories");
                  }}
                  style={styles.allocationBackButton}
                >
                  <Ionicons name="arrow-back" size={28} color={theme.textPrimary} />
                </Pressable>
                <Text style={styles.stepText}>Step 4 of 5</Text>
                <View style={styles.allocationHeaderSpacer} />
              </View>
              <View style={styles.progressTrack}>
                <View style={styles.progressFillAllocation} />
              </View>
            </View>

            <View style={styles.allocationIntro}>
              <Text style={styles.allocationTitle}>How much will you spend?</Text>
              <Text style={styles.allocationSubtitle}>
                Drag to set % of income for each category
              </Text>
            </View>

            <View style={styles.allocationRows}>
              {selectedCategories.map((category) => {
                const value = categoryAllocations[category] ?? 10;
                return (
                  <View key={category} style={styles.allocationCard}>
                    <View style={styles.allocationCardHeader}>
                      <View style={styles.allocationLabelGroup}>
                        <Text style={styles.allocationEmoji}>{categoryIcons[category]}</Text>
                        <Text style={styles.allocationCategory}>{category}</Text>
                      </View>
                      <View style={styles.percentPill}>
                        <TextInput
                          keyboardType="number-pad"
                          maxLength={3}
                          onChangeText={(text) => {
                            const next = Math.min(
                              100,
                              Number(text.replace(/\D/g, "")) || 0
                            );
                            setCategoryAllocations((current) => ({
                              ...current,
                              [category]: next
                            }));
                          }}
                          style={styles.percentInput}
                          value={`${value}%`}
                        />
                      </View>
                    </View>
                    <View style={styles.sliderTrack}>
                      <View style={[styles.sliderFilled, { width: `${value}%` }]} />
                      <View style={[styles.sliderHandle, { left: `${Math.max(0, value - 3)}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.allocationIndicator}>
              <View style={styles.percentRing}>
                <View style={styles.percentRingInner}>
                  <Text style={styles.percentRingText}>{allocatedPercent}%</Text>
                </View>
              </View>
              <View style={styles.allocationSummary}>
                <Text style={styles.allocationSummaryTitle}>
                  {allocatedPercent}% Allocated
                </Text>
                <Text style={styles.allocationSummaryText}>
                  ₹{new Intl.NumberFormat("en-IN").format(savingsRemaining)} remaining
                  for savings
                </Text>
              </View>
            </View>
            {error ? <Text style={styles.categoryError}>{error}</Text> : null}
          </View>

          <View style={styles.allocationFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={completeAllocationStep}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : authStep === "savings" ? (
        <>
          <View style={styles.savingsContent}>
            <View style={styles.allocationHeader}>
              <View style={styles.allocationHeaderRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setError("");
                    setAuthStep("allocation");
                  }}
                  style={styles.allocationBackButton}
                >
                  <Ionicons name="arrow-back" size={28} color={theme.textPrimary} />
                </Pressable>
                <Text style={styles.stepText}>Step 5 of 5</Text>
                <View style={styles.allocationHeaderSpacer} />
              </View>
              <View style={styles.progressTrack}>
                <View style={styles.progressFillSavings} />
              </View>
            </View>

            <View style={styles.savingsPanel}>
              <View style={styles.piggyBadge}>
                <Text style={styles.piggyEmoji}>🐷</Text>
                <View style={styles.piggyCoin}>
                  <Text style={styles.piggyCoinText}>₹</Text>
                </View>
              </View>

              <View style={styles.centerCopy}>
                <Text style={styles.centerTitle}>Set your savings goal</Text>
                <Text style={styles.centerSubtitle}>
                  We'll track whether you hit it each month
                </Text>
              </View>

              <View style={styles.savingsInputGroup}>
                <View style={styles.savingsInputBox}>
                  <Text style={styles.savingsPrefix}>₹</Text>
                  <TextInput
                    keyboardType="number-pad"
                    onChangeText={(value) => {
                      const digits = value.replace(/\D/g, "");
                      setSavingsGoal(
                        digits ? new Intl.NumberFormat("en-IN").format(Number(digits)) : ""
                      );
                    }}
                    selectionColor={theme.brand}
                    style={styles.savingsInput}
                    value={savingsGoal}
                  />
                </View>

                <View style={styles.investToggleRow}>
                  <Text style={styles.investToggleLabel}>I also invest</Text>
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: alsoInvest }}
                    onPress={() => setAlsoInvest((current) => !current)}
                    style={[
                      styles.investToggle,
                      !alsoInvest && styles.investToggleOff
                    ]}
                  >
                    <View
                      style={[
                        styles.investToggleThumb,
                        !alsoInvest && styles.investToggleThumbOff
                      ]}
                    />
                  </Pressable>
                </View>

                {alsoInvest ? (
                  <View style={styles.investmentInputGroup}>
                    <View style={styles.investmentInputBox}>
                      <Text style={styles.investmentPrefix}>₹</Text>
                      <TextInput
                        keyboardType="number-pad"
                        onChangeText={(value) => {
                          const digits = value.replace(/\D/g, "");
                          setInvestmentAmount(
                            digits
                              ? new Intl.NumberFormat("en-IN").format(Number(digits))
                              : ""
                          );
                        }}
                        selectionColor={theme.brand}
                        style={styles.investmentInput}
                        value={investmentAmount}
                      />
                      <Text style={styles.investmentSuffix}> / month</Text>
                    </View>

                    <View style={styles.investmentChips}>
                      {["SIP", "Stocks", "FD", "Crypto"].map((type) => {
                        const selected = investmentType === type;
                        return (
                          <Pressable
                            accessibilityRole="button"
                            key={type}
                            onPress={() => setInvestmentType(type)}
                            style={[
                              styles.investmentChip,
                              selected && styles.investmentChipSelected
                            ]}
                          >
                            <Text style={styles.investmentChipText}>{type}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}
              </View>

              <View style={styles.tipCard}>
                <Text style={styles.tipEmoji}>💰</Text>
                <Text style={styles.tipText}>Even ₹500/month grows into ₹6,000 a year</Text>
              </View>
              {error ? <Text style={styles.categoryError}>{error}</Text> : null}
            </View>
          </View>

          <View style={styles.savingsFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={completeSavingsStep}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Finish Setup</Text>
            </Pressable>

            <View style={styles.homeIndicator}>
              <View style={styles.indicatorBar} />
            </View>
          </View>
        </>
      ) : (
        <View style={styles.completeScreen}>
          {[
            [29, 386, "#FF5533"],
            [189, 191, "#FFA533"],
            [393, 345, "#FFD733"],
            [86, 188, "#FF5533"],
            [399, 36, "#FFA533"],
            [96, 203, "#FFD733"],
            [117, 197, "#FF5533"],
            [184, 267, "#FFA533"],
            [296, 355, "#FFD733"],
            [15, 184, "#FF5533"],
            [134, 296, "#FFA533"],
            [110, 198, "#FFD733"],
            [367, 271, "#FF5533"],
            [207, 48, "#FFA533"],
            [264, 381, "#FFD733"]
          ].map(([left, top, color], index) => (
            <View
              key={index}
              style={[
                styles.confettiDot,
                { left: Number(left), top: Number(top), backgroundColor: String(color) }
              ]}
            />
          ))}

          <View style={styles.completeContent}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={64} color={theme.textPrimary} />
            </View>

            <View style={styles.completeCopy}>
              <Text style={styles.completeTitle}>
                You're all set, {fullName.trim().split(" ")[0] || "Rahul"}! 🎉
              </Text>
              <Text style={styles.completeSubtitle}>
                Your personalized Spenzaa dashboard is ready
              </Text>
            </View>
          </View>

          <View style={styles.completeFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={goToDashboard}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
            </Pressable>
            <View style={styles.homeIndicator}>
              <View style={styles.indicatorBar} />
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.background,
    borderRadius: Platform.OS === "web" ? 32 : 0,
    flex: 1,
    overflow: "hidden"
  },
  statusBar: {
    height: 44,
    position: "relative",
    width: "100%"
  },
  time: {
    color: theme.textPrimary,
    fontFamily: "Figtree",
    fontSize: 14,
    fontWeight: "600",
    left: 24,
    lineHeight: 17,
    position: "absolute",
    top: 13.5
  },
  icons: {
    height: 12,
    position: "absolute",
    right: 24,
    top: 16,
    width: 68
  },
  screenContent: {
    gap: 48,
    height: 300,
    paddingHorizontal: 24,
    paddingVertical: 24
  },
  otpContent: {
    gap: 40,
    height: 331,
    paddingHorizontal: 24,
    paddingVertical: 24
  },
  setupContent: {
    height: 496,
    paddingHorizontal: 24,
    paddingVertical: 24
  },
  incomeContent: {
    height: 621,
    paddingHorizontal: 24,
    paddingVertical: 24
  },
  categoriesContent: {
    height: 717,
    paddingHorizontal: 24,
    paddingVertical: 24
  },
  backButton: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 24
  },
  onboardingHeader: {
    gap: 24,
    height: 140,
    paddingTop: 12
  },
  onboardingHeaderCompact: {
    gap: 24,
    height: 140,
    paddingTop: 12
  },
  stepHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 100,
    justifyContent: "space-between"
  },
  stepText: {
    color: theme.textSecondary,
    fontFamily: "Figtree",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 17
  },
  headerSpacer: {
    height: 24,
    width: 24
  },
  progressTrack: {
    backgroundColor: theme.textPrimary,
    borderRadius: 2,
    height: 4,
    overflow: "hidden",
    width: "100%"
  },
  progressFill: {
    backgroundColor: theme.brand,
    borderRadius: 2,
    height: 4,
    width: 71
  },
  progressFillIncome: {
    backgroundColor: theme.brand,
    borderRadius: 2,
    height: 4,
    width: 142
  },
  progressFillCategories: {
    backgroundColor: theme.brand,
    borderRadius: 2,
    height: 4,
    width: 212
  },
  progressFillAllocation: {
    backgroundColor: theme.brand,
    borderRadius: 2,
    height: 4,
    width: 274
  },
  progressFillSavings: {
    backgroundColor: theme.brand,
    borderRadius: 2,
    height: 4,
    width: "100%"
  },
  logo: {
    alignSelf: "center",
    color: theme.brand,
    fontFamily: "Outfit",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 40
  },
  headingGroup: {
    gap: 12
  },
  title: {
    color: theme.textPrimary,
    fontFamily: "Outfit",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 35
  },
  subtitle: {
    color: theme.textSecondary,
    fontFamily: "Figtree",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 19
  },
  subtitleStrong: {
    color: theme.textPrimary,
    fontWeight: "700"
  },
  namePanel: {
    alignItems: "center",
    gap: 32,
    height: 260,
    marginTop: 48
  },
  userBadge: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    shadowColor: theme.brand,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    width: 80,
    elevation: 8
  },
  incomeBadgeText: {
    color: theme.textPrimary,
    fontFamily: "Outfit",
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 50
  },
  centerCopy: {
    alignItems: "center",
    gap: 12,
    width: "100%"
  },
  centerTitle: {
    color: theme.textPrimary,
    fontFamily: "Outfit",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 35,
    textAlign: "center"
  },
  centerSubtitle: {
    color: theme.textSecondary,
    fontFamily: "Figtree",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 19,
    textAlign: "center"
  },
  centerSubtitleSuccess: {
    color: "#10B981"
  },
  nameInputBox: {
    backgroundColor: theme.card,
    borderColor: theme.textPrimary,
    borderRadius: 16,
    borderWidth: 1,
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 16,
    width: "100%"
  },
  nameInputBoxFilled: {
    borderColor: theme.brand,
    borderWidth: 1.5
  },
  nameInput: {
    color: theme.textPrimary,
    fontFamily: "Figtree",
    fontSize: 18,
    fontWeight: "400",
    height: 50,
    lineHeight: 22,
    padding: 0
  },
  incomePanel: {
    alignItems: "center",
    gap: 32,
    height: 385,
    marginTop: 48
  },
  incomeInputBox: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderColor: theme.brand,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    height: 71,
    paddingHorizontal: 20,
    width: "100%"
  },
  incomePrefix: {
    color: theme.brand,
    fontFamily: "Outfit",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 35
  },
  incomeInput: {
    color: theme.textPrimary,
    flex: 1,
    fontFamily: "Outfit",
    fontSize: 28,
    fontWeight: "800",
    height: 71,
    lineHeight: 35,
    padding: 0
  },
  incomeChips: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: 8
  },
  incomeChip: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderColor: theme.textPrimary,
    borderRadius: 100,
    borderWidth: 1,
    height: 37,
    justifyContent: "center",
    paddingHorizontal: 16
  },
  incomeChipSelected: {
    backgroundColor: theme.brand,
    borderColor: theme.brand
  },
  incomeChipText: {
    color: theme.textPrimary,
    fontFamily: "Figtree",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 17
  },
  categoriesHeading: {
    gap: 12,
    marginTop: 32
  },
  categoriesTitle: {
    color: theme.textPrimary,
    fontFamily: "Outfit",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 35,
    maxWidth: 354
  },
  categoriesSubtitle: {
    color: theme.textSecondary,
    fontFamily: "Figtree",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 19
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 32
  },
  categoryTile: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderColor: theme.textPrimary,
    borderRadius: 20,
    borderWidth: 1,
    height: 82,
    justifyContent: "center",
    paddingVertical: 16,
    position: "relative",
    width: 110
  },
  categoryTileSelected: {
    borderColor: theme.brand,
    borderWidth: 2
  },
  categoryIcon: {
    fontFamily: "Inter",
    fontSize: 28,
    lineHeight: 28,
    marginBottom: 8
  },
  categoryLabel: {
    color: theme.textSecondary,
    fontFamily: "Figtree",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14,
    textAlign: "center"
  },
  categoryLabelSelected: {
    color: theme.brand
  },
  categoryCheck: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderRadius: 9,
    height: 18,
    justifyContent: "center",
    position: "absolute",
    right: 10,
    top: 10,
    width: 18
  },
  categoryError: {
    color: theme.brand,
    fontFamily: "Figtree",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center"
  },
  allocationScrollContent: {
    minHeight: 969,
    paddingBottom: 24
  },
  allocationMain: {
    gap: 32,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  allocationHeader: {
    gap: 24,
    height: 68
  },
  allocationHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 40,
    justifyContent: "space-between"
  },
  allocationBackButton: {
    alignItems: "center",
    backgroundColor: "#262638",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  allocationHeaderSpacer: {
    height: 40,
    width: 40
  },
  allocationIntro: {
    gap: 12
  },
  allocationTitle: {
    color: theme.textPrimary,
    fontFamily: "Outfit",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 35
  },
  allocationSubtitle: {
    color: theme.textSecondary,
    fontFamily: "Figtree",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 19
  },
  allocationRows: {
    gap: 12
  },
  allocationCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    gap: 16,
    height: 88,
    padding: 16
  },
  allocationCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  allocationLabelGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  allocationEmoji: {
    fontFamily: "Inter",
    fontSize: 20,
    lineHeight: 20
  },
  allocationCategory: {
    color: theme.textPrimary,
    fontFamily: "Figtree",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 19
  },
  percentPill: {
    alignItems: "center",
    backgroundColor: "#262638",
    borderRadius: 100,
    height: 24,
    justifyContent: "center",
    minWidth: 39,
    paddingHorizontal: 10
  },
  percentInput: {
    color: theme.brand,
    fontFamily: "Figtree",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 16,
    minWidth: 24,
    padding: 0,
    textAlign: "center"
  },
  sliderTrack: {
    backgroundColor: theme.textPrimary,
    borderRadius: 2,
    height: 4,
    position: "relative",
    width: "100%"
  },
  sliderFilled: {
    backgroundColor: theme.brand,
    borderRadius: 2,
    height: 4
  },
  sliderHandle: {
    backgroundColor: theme.textPrimary,
    borderColor: theme.brand,
    borderRadius: 8,
    borderWidth: 4,
    height: 16,
    position: "absolute",
    top: -6,
    width: 16
  },
  allocationIndicator: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderColor: theme.textPrimary,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 20,
    height: 100,
    paddingHorizontal: 20
  },
  percentRing: {
    alignItems: "center",
    borderColor: theme.brand,
    borderRadius: 30,
    borderWidth: 7,
    height: 60,
    justifyContent: "center",
    width: 60
  },
  percentRingInner: {
    alignItems: "center",
    borderColor: theme.textPrimary,
    borderRadius: 22,
    borderWidth: 4,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  percentRingText: {
    color: theme.textPrimary,
    fontFamily: "Figtree",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 16
  },
  allocationSummary: {
    gap: 2
  },
  allocationSummaryTitle: {
    color: theme.textPrimary,
    fontFamily: "Figtree",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18
  },
  allocationSummaryText: {
    color: theme.textSecondary,
    fontFamily: "Figtree",
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 16
  },
  inputGroup: {
    flexDirection: "row",
    gap: 12,
    height: 50
  },
  countryBox: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderColor: theme.textPrimary,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    height: 50,
    paddingHorizontal: 16,
    width: 94
  },
  flag: {
    borderRadius: 2,
    height: 16,
    width: 24
  },
  countryCode: {
    color: theme.textPrimary,
    fontFamily: "Figtree",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 22
  },
  phoneBox: {
    backgroundColor: theme.card,
    borderColor: theme.brand,
    borderRadius: 16,
    borderWidth: 1.5,
    flex: 1,
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 16
  },
  phoneInput: {
    color: theme.textPrimary,
    fontFamily: "Figtree",
    fontSize: 18,
    fontWeight: "500",
    height: 50,
    lineHeight: 22,
    padding: 0
  },
  error: {
    color: theme.brand,
    fontFamily: "Figtree",
    fontSize: 13,
    fontWeight: "600",
    marginTop: -36
  },
  otpRow: {
    flexDirection: "row",
    gap: 8,
    height: 56,
    width: "100%"
  },
  otpBox: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderColor: theme.textPrimary,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    height: 56,
    justifyContent: "center"
  },
  otpBoxActive: {
    borderColor: theme.brand,
    borderWidth: 2
  },
  otpDigit: {
    color: theme.textPrimary,
    fontFamily: "Outfit",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30
  },
  otpCaret: {
    backgroundColor: theme.brand,
    height: 24,
    width: 2
  },
  hiddenOtpInput: {
    height: 1,
    opacity: 0,
    position: "absolute",
    width: 1
  },
  resendRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    justifyContent: "center"
  },
  resendText: {
    color: theme.textSecondary,
    fontFamily: "Figtree",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 17
  },
  resendTime: {
    color: theme.brand,
    fontFamily: "Figtree",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 17
  },
  otpError: {
    color: theme.brand,
    fontFamily: "Figtree",
    fontSize: 13,
    fontWeight: "600",
    marginTop: -28,
    textAlign: "center"
  },
  nameError: {
    color: theme.brand,
    fontFamily: "Figtree",
    fontSize: 13,
    fontWeight: "600",
    marginTop: -20,
    textAlign: "center"
  },
  footer: {
    gap: 20,
    marginTop: "auto",
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  otpFooter: {
    gap: 16,
    marginTop: "auto",
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  categoriesFooter: {
    gap: 16,
    marginTop: "auto",
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  allocationFooter: {
    paddingHorizontal: 24,
    paddingTop: 24
  },
  savingsContent: {
    height: 687,
    paddingHorizontal: 24,
    paddingVertical: 24
  },
  savingsPanel: {
    alignItems: "center",
    gap: 32,
    height: 531,
    marginTop: 40
  },
  piggyBadge: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    position: "relative",
    width: 80
  },
  piggyEmoji: {
    fontFamily: "Inter",
    fontSize: 36,
    lineHeight: 36
  },
  piggyCoin: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: -4,
    top: -4,
    width: 24
  },
  piggyCoinText: {
    color: theme.textPrimary,
    fontFamily: "Inter",
    fontSize: 12,
    lineHeight: 15
  },
  savingsInputGroup: {
    gap: 20,
    width: "100%"
  },
  savingsInputBox: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderColor: theme.brand,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    height: 70,
    paddingHorizontal: 20,
    width: "100%"
  },
  savingsPrefix: {
    color: theme.brand,
    fontFamily: "Outfit",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30
  },
  savingsInput: {
    color: theme.textPrimary,
    flex: 1,
    fontFamily: "Outfit",
    fontSize: 24,
    fontWeight: "800",
    height: 70,
    lineHeight: 30,
    padding: 0
  },
  investToggleRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 28,
    justifyContent: "space-between"
  },
  investToggleLabel: {
    color: theme.textPrimary,
    fontFamily: "Figtree",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 19
  },
  investToggle: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderRadius: 14,
    height: 28,
    padding: 2,
    width: 52
  },
  investToggleOff: {
    alignItems: "flex-start",
    backgroundColor: "#262638"
  },
  investToggleThumb: {
    alignSelf: "flex-end",
    backgroundColor: theme.textPrimary,
    borderRadius: 12,
    height: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 24,
    elevation: 2
  },
  investToggleThumbOff: {
    alignSelf: "flex-start"
  },
  investmentInputGroup: {
    gap: 16
  },
  investmentInputBox: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderRadius: 16,
    flexDirection: "row",
    height: 51,
    paddingHorizontal: 16
  },
  investmentPrefix: {
    color: theme.textPrimary,
    fontFamily: "Figtree",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 19
  },
  investmentInput: {
    color: theme.textPrimary,
    fontFamily: "Figtree",
    fontSize: 16,
    fontWeight: "400",
    height: 51,
    lineHeight: 19,
    minWidth: 48,
    padding: 0
  },
  investmentSuffix: {
    color: theme.textPrimary,
    fontFamily: "Figtree",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 19
  },
  investmentChips: {
    flexDirection: "row",
    gap: 8
  },
  investmentChip: {
    alignItems: "center",
    backgroundColor: "#262638",
    borderRadius: 100,
    height: 32,
    justifyContent: "center",
    paddingHorizontal: 16
  },
  investmentChipSelected: {
    backgroundColor: theme.brand
  },
  investmentChipText: {
    color: theme.textPrimary,
    fontFamily: "Figtree",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 16
  },
  tipCard: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    height: 52,
    paddingHorizontal: 16,
    width: "100%"
  },
  tipEmoji: {
    fontFamily: "Inter",
    fontSize: 20,
    lineHeight: 20
  },
  tipText: {
    color: "#FEF0F2",
    flex: 1,
    fontFamily: "Figtree",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20
  },
  savingsFooter: {
    gap: 0,
    marginTop: "auto",
    paddingHorizontal: 24,
    paddingTop: 24
  },
  completeScreen: {
    flex: 1,
    padding: 24,
    position: "relative"
  },
  confettiDot: {
    borderRadius: 4,
    height: 8,
    opacity: 0.6,
    position: "absolute",
    width: 8
  },
  completeContent: {
    alignItems: "center",
    gap: 40,
    height: 240,
    marginTop: 0
  },
  checkCircle: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderRadius: 50,
    height: 100,
    justifyContent: "center",
    shadowColor: theme.brand,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    width: 100,
    elevation: 10
  },
  completeCopy: {
    alignItems: "center",
    gap: 16,
    width: "100%"
  },
  completeTitle: {
    color: theme.textPrimary,
    fontFamily: "Outfit",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 40,
    textAlign: "center"
  },
  completeSubtitle: {
    color: theme.textSecondary,
    fontFamily: "Figtree",
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 22,
    textAlign: "center"
  },
  completeFooter: {
    gap: 20,
    marginTop: "auto"
  },
  terms: {
    color: theme.textSecondary,
    fontFamily: "Figtree",
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 16,
    textAlign: "center"
  },
  termsLink: {
    color: theme.brand,
    fontWeight: "600"
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.brand,
    borderRadius: 100,
    height: 55,
    justifyContent: "center",
    paddingHorizontal: 18
  },
  primaryButtonText: {
    color: theme.textPrimary,
    fontFamily: "Figtree",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 19
  },
  homeIndicator: {
    alignItems: "center",
    height: 34,
    justifyContent: "center"
  },
  indicatorBar: {
    backgroundColor: theme.indicator,
    borderRadius: 100,
    height: 5,
    width: 134
  },
  pressed: {
    opacity: 0.84
  }
});
