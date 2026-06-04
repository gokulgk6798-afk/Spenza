import { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path, Rect } from "react-native-svg";

const theme = {
  background: "#121212",
  brand: "#FF5533",
  textPrimary: "#FFFFFF",
  textSecondary: "#71717A"
};

const slides: Array<{
  title: string;
  description: string;
  image: ImageSourcePropType;
  buttonLabel: string;
  showSkip: boolean;
}> = [
  {
    title: "Take control of your money",
    description: "Understand where every rupee goes — and plan where it should",
    image: require("../assets/images/get-started-money-wallet.png"),
    buttonLabel: "Next",
    showSkip: true
  },
  {
    title: "Grow your savings, stress-free",
    description:
      "Set budgets, track investments, and hit your financial goals every month",
    image: require("../assets/images/get-started-savings-pig.png"),
    buttonLabel: "Get Started",
    showSkip: false
  }
];

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

export function GetStartedScreen({ onDone }: { onDone: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];
  const isFinalSlide = activeIndex === slides.length - 1;

  function handlePrimaryAction() {
    if (isFinalSlide) {
      onDone();
      return;
    }

    setActiveIndex((current) => current + 1);
  }

  return (
    <View style={styles.screen}>
      <StatusBar hidden style="light" backgroundColor={theme.background} />
      <View style={styles.statusBar}>
        <Text style={styles.time}>9:41</Text>
        <View style={styles.icons}>
          <StatusIcons />
        </View>
      </View>

      <View style={styles.content}>
        <Image resizeMode="cover" source={activeSlide.image} style={styles.hero} />

        <View style={styles.copy}>
          <Text style={styles.title}>{activeSlide.title}</Text>
          <Text style={styles.description}>{activeSlide.description}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((slide, index) => (
            <View
              key={slide.title}
              style={index === activeIndex ? styles.activeDot : styles.inactiveDot}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={handlePrimaryAction}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>{activeSlide.buttonLabel}</Text>
          </Pressable>
          {activeSlide.showSkip ? (
            <Pressable accessibilityRole="button" onPress={onDone} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.homeIndicator}>
          <View style={styles.indicatorBar} />
        </View>
      </View>
    </View>
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
  content: {
    gap: 40,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  hero: {
    alignSelf: "center",
    borderRadius: 24,
    height: 400,
    maxWidth: 354,
    overflow: "hidden",
    width: "100%"
  },
  copy: {
    gap: 16,
    minHeight: 144
  },
  title: {
    color: theme.textPrimary,
    fontFamily: "Outfit",
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 40
  },
  description: {
    color: theme.textSecondary,
    fontFamily: "Figtree",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24
  },
  footer: {
    gap: 24,
    marginTop: "auto",
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  pagination: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    height: 8,
    justifyContent: "center"
  },
  activeDot: {
    backgroundColor: theme.brand,
    borderRadius: 4,
    height: 8,
    width: 24
  },
  inactiveDot: {
    backgroundColor: theme.textPrimary,
    borderRadius: 4,
    height: 8,
    width: 8
  },
  actions: {
    gap: 16
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
  skipButton: {
    alignItems: "center",
    height: 17,
    justifyContent: "center"
  },
  skipText: {
    color: theme.textSecondary,
    fontFamily: "Figtree",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 17
  },
  homeIndicator: {
    alignItems: "center",
    height: 34,
    justifyContent: "center"
  },
  indicatorBar: {
    backgroundColor: theme.textPrimary,
    borderRadius: 100,
    height: 5,
    opacity: 0.2,
    width: 134
  },
  pressed: {
    opacity: 0.84
  }
});
