import { useAuth } from "@/context/AuthContext";
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Redirect, Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    console.log("Push Notifications: Must use physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // --- FIX: TRY/CATCH TO PREVENT CRASH IF PROJECT ID IS MISSING ---
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (error) {
    console.log("Push Notification Warning: Project ID not found. Notifications disabled.");
    // This allows the app to continue running without crashing
    return null;
  }
}

const TabsLayout = () => {
  const { isSignedIn, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isSignedIn) {
      registerForPushNotificationsAsync().then(token => {
        if (token && marketAPI && marketAPI.updatePushToken) {
          console.log("Push Token Generated:", token);
          marketAPI.updatePushToken(token).catch(err => console.log("Token sync error (Ignorable)"));
        }
      });
    }
  }, [isSignedIn]);

  if (isLoading) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1DB954",
        tabBarInactiveTintColor: "#B3B3B3",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingTop: 10,
          marginHorizontal: 20,
          marginBottom: insets.bottom + 10,
          borderRadius: 24,
          overflow: "hidden",
        },
        tabBarBackground: () => (
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        ),
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600", marginBottom: 5 },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;