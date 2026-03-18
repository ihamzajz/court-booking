import { Text, StyleSheet, StatusBar, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { router } from "expo-router";

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  return (
    <LinearGradient
      colors={["#007FFF", "#2A52BE"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.icon}>T</Text>

        <Text style={styles.primaryText}>
          Court Booking App for{"\n"}North Nazimabad Gymkhana
        </Text>

        <Text style={styles.secondaryText}>
          Book Tennis and Padel Courts Instantly
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 72,
    marginBottom: 26,
    color: "#FFFFFF",
    fontWeight: "800",
  },
  primaryText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 34,
  },
  secondaryText: {
    marginTop: 14,
    fontSize: 15,
    color: "#DDE9FF",
    textAlign: "center",
    letterSpacing: 0.4,
  },
});
