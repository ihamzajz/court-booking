import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AppScreen from "../../components/AppScreen";

const palette = {
  bg: "#F4F8FF",
  ink: "#112A5C",
  muted: "#5B6F9E",
  navy: "#2A52BE",
  royal: "#007FFF",
  card: "#FFFFFF",
  line: "#D9E4FF",
  mint: "#EAF4FF",
};

export default function Booking() {
  const tabBarHeight = useBottomTabBarHeight();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        setRole(user.role);
      }
    };
    loadUser();
  }, []);

  const cards = [
    {
      title: "Court Booking",
      subtitle: "Choose court, time, and availability in a cleaner booking flow.",
      icon: "sports-tennis",
      link: "/(tabs)/court",
      colors: ["#007FFF", "#2A52BE"],
    },
    {
      title: "Event Booking",
      subtitle: "Reserve event and hall space with a more guided experience.",
      icon: "event",
      link: "/(tabs)/event",
      colors: ["#007FFF", "#2A52BE"],
    },
    {
      title: "Request History",
      subtitle: "Review your earlier booking requests and follow-up status.",
      icon: "history",
      link: "/(tabs)/history",
      colors: ["#FFFFFF", "#FFFFFF"],
      outlined: true,
    },
  ];

  if (role === "admin" || role === "superadmin") {
    cards.push({
      title: "Court Dashboard",
      subtitle: "Approve, reject, and monitor all booking requests from one panel.",
      icon: "insights",
      link: "/(tabs)/court-dashboard",
      colors: ["#FFFFFF", "#FFFFFF"],
      outlined: true,
    });
  }

  return (
    <AppScreen bottomOffset={tabBarHeight + 34} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={["#007FFF", "#2A52BE"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroBadge}>
          <MaterialIcons name="sports-tennis" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.heroTitle}>Booking Center</Text>
        <Text style={styles.heroSubtitle}>
          Pick the kind of booking you want and move through a much clearer flow.
        </Text>
      </LinearGradient>

      <LinearGradient
        colors={["#007FFF", "#2A52BE"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.tipBanner}
      >
        <View style={styles.tipIcon}>
          <MaterialIcons name="schedule" size={22} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Find courts that fit your time</Text>
          <Text style={styles.tipText}>Start with a slot, then let the app guide the rest.</Text>
        </View>
      </LinearGradient>

      <View style={styles.grid}>
        {cards.map((card) => {
          const content = (
            <View style={styles.cardInner}>
              <View style={[styles.cardIcon, card.outlined && styles.cardIconOutlined]}>
                <MaterialIcons
                  name={card.icon}
                  size={24}
                  color={card.outlined ? palette.navy : "#FFFFFF"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, card.outlined && styles.cardTitleOutlined]}>
                  {card.title}
                </Text>
                <Text style={[styles.cardSubtitle, card.outlined && styles.cardSubtitleOutlined]}>
                  {card.subtitle}
                </Text>
              </View>
              <MaterialIcons
                name="arrow-forward-ios"
                size={18}
                color={card.outlined ? palette.muted : "rgba(255,255,255,0.88)"}
              />
            </View>
          );

          if (card.outlined) {
            return (
              <Pressable key={card.title} style={styles.outlinedCard} onPress={() => router.push(card.link)}>
                {content}
              </Pressable>
            );
          }

          return (
            <Pressable key={card.title} style={styles.gradientCardWrap} onPress={() => router.push(card.link)}>
              <LinearGradient colors={card.colors} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.gradientCard}>
                {content}
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 10,
  },
  hero: {
    borderRadius: 28,
    padding: 22,
  },
  heroBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 300,
  },
  tipBanner: {
    marginTop: 16,
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  tipTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
  tipText: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 13,
    marginTop: 4,
  },
  grid: {
    marginTop: 22,
    gap: 14,
  },
  gradientCardWrap: {
    borderRadius: 24,
    overflow: "hidden",
  },
  gradientCard: {
    borderRadius: 24,
    minHeight: 132,
    padding: 18,
  },
  outlinedCard: {
    minHeight: 126,
    borderRadius: 24,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 18,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconOutlined: {
    backgroundColor: palette.mint,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontFamily: "Poppins_700Bold",
  },
  cardTitleOutlined: {
    color: palette.ink,
  },
  cardSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 240,
  },
  cardSubtitleOutlined: {
    color: palette.muted,
  },
});
