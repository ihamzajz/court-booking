import * as SecureStore from "expo-secure-store";

const USER_STORAGE_KEY = "user";

export async function getStoredUser() {
  const rawUser = await SecureStore.getItemAsync(USER_STORAGE_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
    return null;
  }
}

export async function setStoredUser(user) {
  await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(user));
}

export async function clearStoredUser() {
  await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
}

export async function getStoredToken() {
  const user = await getStoredUser();
  return user?.token || null;
}
