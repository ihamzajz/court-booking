import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_STORAGE_KEY = "user";

export async function getStoredUser() {
  const rawUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export async function setStoredUser(user) {
  await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export async function clearStoredUser() {
  await AsyncStorage.removeItem(USER_STORAGE_KEY);
}
