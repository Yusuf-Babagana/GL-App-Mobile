import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

// Merely *importing* expo-notifications triggers a warning in Expo Go
// (remote push was removed from Expo Go in SDK 53+), which crashes the
// Metro dev server in this environment. So we detect Expo Go up front and
// avoid importing the module at all in that case — the dynamic import below
// only runs (and only pulls expo-notifications into the bundle-eval path)
// when we're actually in a dev/production build.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Requests notification permission and returns an Expo push token, or null
 * if permission was denied or registration failed for any reason (e.g. no
 * physical device, no network, or running in Expo Go). Never throws — push
 * registration should never block app startup.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (isExpoGo) {
    console.log("[push] Skipping push registration — not supported in Expo Go, use a development build.");
    return null;
  }

  try {
    const Notifications = await import("expo-notifications");

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return tokenResponse.data;
  } catch (error) {
    console.error("[push] registration failed:", error);
    return null;
  }
}
