import { useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  useEffect(() => {
    const init = async () => {
      const user = await AsyncStorage.getItem("user");

      if (user) {
        router.replace("/(tabs)/home"); // logged in
      } else {
        router.replace("/splash-screen"); // not logged in
      }
    };

    init();
  }, []);

  return null;
}
