// app/(tabs)/_layout.tsx - Updated Professional Flow
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { isSignedIn } = useAuth();
  const { cartCount } = useCart();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#329629", // Primary Green
        tabBarInactiveTintColor: "#94A3B8", // Slate Gray
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom + 5,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: 0.5
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Products",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />
          ),
        }}
      />

      {/* Video Ads Tab (Live) */}
      <Tabs.Screen
        name="live"
        options={{
          title: "Live",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "play-circle" : "play-circle-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="markets" // You will create/rename a file to markets.tsx
        options={{
          title: "Markets",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "storefront" : "storefront-outline"} size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#EF4444', color: 'white', fontSize: 10, fontWeight: 'bold' },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "cart" : "cart-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "ellipsis-horizontal-circle" : "ellipsis-horizontal-circle-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}