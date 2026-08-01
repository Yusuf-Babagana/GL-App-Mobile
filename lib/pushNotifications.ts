import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Requests notification permission and returns an Expo push token, or null
 * if permission was denied or registration failed for any reason (e.g. no
 * physical device, no network). Never throws — push registration should
 * never block app startup.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
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
