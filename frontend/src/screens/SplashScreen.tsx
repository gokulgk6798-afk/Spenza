import { Platform, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path, Rect } from "react-native-svg";

const figma = {
  background: "#0D0D14",
  brand: "#FF5F40",
  textPrimary: "#FFFFFF",
  textTertiary: "#A1A1AA"
};

function StatusIcons() {
  return (
    <Svg width={68} height={12} viewBox="0 0 68 12" fill="none">
      <Path
        d="M1 11V9.5M6 11V7M11 11V4.5M16 11V1"
        stroke={figma.textPrimary}
        strokeLinecap="round"
        strokeWidth={2}
      />
      <Path
        d="M24 4.9C27.6 1.6 32.4 1.6 36 4.9M27 7.7C28.8 6.1 31.2 6.1 33 7.7"
        stroke={figma.textPrimary}
        strokeLinecap="round"
        strokeWidth={2}
      />
      <Circle cx={30} cy={10.5} r={1.2} fill={figma.textPrimary} />
      <Rect
        x={45}
        y={1}
        width={18}
        height={10}
        rx={2}
        stroke={figma.textPrimary}
        strokeWidth={2}
      />
      <Path
        d="M66 4.5V7.5"
        stroke={figma.textPrimary}
        strokeLinecap="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

export function SplashScreen() {
  return (
    <View style={styles.screen}>
      <StatusBar hidden style="light" backgroundColor={figma.background} />
      <View style={styles.statusBar}>
        <Text style={styles.time}>9:41</Text>
        <View style={styles.icons}>
          <StatusIcons />
        </View>
      </View>

      <View style={styles.splashMain}>
        <View style={styles.logoGraphic}>
          <View style={styles.outerGlow} />
          <View style={styles.innerGlow} />
          <Text style={styles.logo}>Spenzaa</Text>
        </View>
        <Text style={styles.tagline}>Track. Budget. Save.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: figma.background,
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
    color: figma.textPrimary,
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
  splashMain: {
    flex: 1,
    position: "relative"
  },
  logoGraphic: {
    height: 60,
    left: "50%",
    marginLeft: -97,
    position: "absolute",
    top: 295.5,
    width: 194
  },
  outerGlow: {
    backgroundColor: figma.brand,
    borderRadius: 100,
    height: 200,
    left: -3,
    opacity: 0.05,
    position: "absolute",
    top: -70,
    width: 200
  },
  innerGlow: {
    backgroundColor: figma.brand,
    borderRadius: 70,
    height: 140,
    left: 27,
    opacity: 0.1,
    position: "absolute",
    top: -40,
    width: 140
  },
  logo: {
    color: figma.brand,
    fontFamily: "Outfit",
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -2,
    lineHeight: 60,
    position: "absolute"
  },
  tagline: {
    color: figma.textTertiary,
    fontFamily: "Outfit",
    fontSize: 20,
    fontWeight: "500",
    left: "50%",
    lineHeight: 25,
    marginLeft: -91,
    position: "absolute",
    top: 379.5,
    width: 182
  }
});
