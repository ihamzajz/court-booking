import { Tabs, router } from "expo-router";
import { useEffect, useState } from "react";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getStoredUser } from "../../src/utils/auth";

const palette = {
  bg: "#F4F8FF",
  surface: "#0A2463",
  surfaceEdge: "#1A377F",
  ink: "#EAF4FF",
  muted: "#AFC6FF",
  navy: "#FFFFFF",
  royal: "#007FFF",
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const ensureSession = async () => {
      const storedUser = await getStoredUser();

      if (!isMounted) return;

      if (!storedUser?.token) {
        router.replace("/login");
        return;
      }

      setIsReady(true);
    };

    ensureSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isReady) {
    return <View style={styles.bootScreen} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarHideOnKeyboard: true,
        sceneStyle: {
          backgroundColor: palette.bg,
        },
        tabBarActiveBackgroundColor: "transparent",
        tabBarInactiveBackgroundColor: "transparent",
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
        tabBarStyle: [
          styles.tabBar,
          {
            bottom: 0,
            height: 68 + bottomInset,
            paddingBottom: bottomInset,
            paddingTop: 10,
          },
        ],
        tabBarActiveTintColor: palette.navy,
        tabBarInactiveTintColor: palette.muted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <MaterialIcons name="home-filled" size={22} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="faqs"
        options={{
          title: "FAQs",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <FontAwesome5 name="question-circle" size={20} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="booking"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <FontAwesome5 name="newspaper" size={20} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <FontAwesome5 name="user-circle" size={20} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen name="manage-users" options={{ href: null }} />
      <Tabs.Screen name="manage-faqs" options={{ href: null }} />
      <Tabs.Screen name="manage-news" options={{ href: null }} />
      <Tabs.Screen name="manage-court" options={{ href: null }} />
      <Tabs.Screen name="manage-event" options={{ href: null }} />
      <Tabs.Screen name="manage-slides" options={{ href: null }} />
      <Tabs.Screen name="court" options={{ href: null }} />
      <Tabs.Screen name="event" options={{ href: null }} />
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="court-dashboard" options={{ href: null }} />
      <Tabs.Screen name="event-dashboard" options={{ href: null }} />
      <Tabs.Screen name="admin-panel" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 12,
    right: 12,
    borderRadius: 24,
    overflow: "hidden",
    borderTopWidth: 0,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: palette.surfaceEdge,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 6,
    shadowColor: "#020617",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 14,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.surface,
  },
  tabBarItem: {
    height: 44,
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBarLabel: {
    marginTop: 0,
    fontSize: 11.5,
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 0.2,
    paddingBottom: 0,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconWrapActive: {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  bootScreen: {
    flex: 1,
    backgroundColor: palette.bg,
  },
});
