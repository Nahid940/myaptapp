import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { api } from "./api";

// Show notifications while the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Requests permission and returns the native FCM/APNs device token,
 * or null if it can't be obtained (simulator, denied permission, etc.).
 *
 * This is the token a backend uses to send DIRECTLY via FCM (Android)
 * or APNs (iOS) — not the Expo push service.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Remote push only works on a physical device.
  if (!Device.isDevice) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#159df8",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  try {
    // On Android this returns the FCM registration token.
    // On iOS this returns the APNs device token.
    const tokenData = await Notifications.getDevicePushTokenAsync();
    return tokenData.data as string;
  } catch {
    return null;
  }
}

/**
 * Registers for push and sends the native FCM token to the backend so the
 * server can target this device. Safe to call multiple times; failures are ignored.
 */
export async function syncPushToken(): Promise<void> {
  const token = await registerForPushNotificationsAsync();
  if (!token) return;
  try {
    // Sends both keys so the backend can read either `token` or `fcm_token`
    // when populating users.fcm_token.
    await api.post("/device-token", {
      token,
      fcm_token: token,
      platform: Platform.OS,
      provider: "fcm",
    });
  } catch {
    // Backend endpoint may differ or be offline — don't crash the app.
  }
}
