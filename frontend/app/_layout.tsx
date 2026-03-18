import React from "react";
import { Stack } from "expo-router";
import { Text, TextInput } from "react-native";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";

let defaultsApplied = false;
let renderPatchApplied = false;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular: require("@expo-google-fonts/poppins/400Regular/Poppins_400Regular.ttf"),
    Poppins_500Medium: require("@expo-google-fonts/poppins/500Medium/Poppins_500Medium.ttf"),
    Poppins_600SemiBold: require("@expo-google-fonts/poppins/600SemiBold/Poppins_600SemiBold.ttf"),
    Poppins_700Bold: require("@expo-google-fonts/poppins/700Bold/Poppins_700Bold.ttf"),
    Poppins_800ExtraBold: require("@expo-google-fonts/poppins/800ExtraBold/Poppins_800ExtraBold.ttf"),
  });

  if (!defaultsApplied && fontsLoaded) {
    defaultsApplied = true;

    const TextComponent = Text as any;
    const TextInputComponent = TextInput as any;

    TextComponent.defaultProps = TextComponent.defaultProps || {};
    TextComponent.defaultProps.style = [
      { fontFamily: "Poppins_500Medium" },
      TextComponent.defaultProps.style,
    ];

    TextInputComponent.defaultProps = TextInputComponent.defaultProps || {};
    TextInputComponent.defaultProps.style = [
      { fontFamily: "Poppins_500Medium" },
      TextInputComponent.defaultProps.style,
    ];
  }

  if (!renderPatchApplied && fontsLoaded) {
    renderPatchApplied = true;

    const TextComponent = Text as any;
    const TextInputComponent = TextInput as any;
    const originalTextRender = TextComponent.render;
    TextComponent.render = function render(...args) {
      const origin = originalTextRender.call(this, ...args);
      return React.cloneElement(origin, {
        style: [{ fontFamily: "Poppins_500Medium" }, origin.props.style],
      });
    };

    const originalTextInputRender = TextInputComponent.render;
    TextInputComponent.render = function render(...args) {
      const origin = originalTextInputRender.call(this, ...args);
      return React.cloneElement(origin, {
        style: [{ fontFamily: "Poppins_500Medium" }, origin.props.style],
      });
    };
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
