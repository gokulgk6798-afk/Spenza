import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProvider, useApp } from "./src/context/AppContext";
import { AuthScreen } from "./src/screens/AuthScreen";
import { GetStartedScreen } from "./src/screens/GetStartedScreen";
import { HomeShell } from "./src/screens/HomeShell";
import { SplashScreen } from "./src/screens/SplashScreen";

function Root() {
  const { user } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [showGetStarted, setShowGetStarted] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!user && showGetStarted) {
    return <GetStartedScreen onDone={() => setShowGetStarted(false)} />;
  }

  return user ? <HomeShell /> : <AuthScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.root}>
      <AppProvider>
        <StatusBar style="dark" />
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
