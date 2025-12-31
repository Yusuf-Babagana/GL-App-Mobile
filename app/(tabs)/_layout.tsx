import { useAuth } from "@/context/AuthContext"; // Change import source
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabsLayout = () => {
  const { isSignedIn, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

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
          height: 60 + insets.bottom, // Adjusted height
          paddingTop: 10,
          marginHorizontal: 20, // Adjusted margins
          marginBottom: insets.bottom + 10,
          borderRadius: 24,
          overflow: "hidden",
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 5,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home", // Renamed from Shop
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