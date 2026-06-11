import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { isSignedIn } = useAuth();
  const { cartCount } = useCart();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#329629",
        tabBarInactiveTintColor: "#94A3B8",
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: 28,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 72 : 68,
          paddingBottom: 0,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#329629',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.3)',
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "800",
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarBackground: () => (
          <View style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: 28,
            backgroundColor: 'rgba(255,255,255,0.85)',
          }} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('products'),
          tabBarIcon: ({ color, focused }) => (
            <View className={`${focused ? 'bg-green-100' : ''} p-1.5 rounded-full`}>
              <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: t('ads'),
          tabBarIcon: ({ color, focused }) => (
            <View className={`${focused ? 'bg-green-100' : ''} p-1.5 rounded-full`}>
              <Ionicons name={focused ? "play-circle" : "play-circle-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: t('market'),
          tabBarIcon: ({ color, focused }) => (
            <View className={`${focused ? 'bg-green-100' : ''} p-1.5 rounded-full`}>
              <Ionicons name={focused ? "cart" : "cart-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          title: t('data_tab'),
          tabBarIcon: ({ color, focused }) => (
            <View className={`${focused ? 'bg-green-100' : ''} p-1.5 rounded-full`}>
              <Ionicons name={focused ? "wifi" : "wifi-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('chats'),
          tabBarIcon: ({ color, focused }) => (
            <View className={`${focused ? 'bg-green-100' : ''} p-1.5 rounded-full`}>
              <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('cart_tab'),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#EF4444', color: 'white', fontSize: 10, fontWeight: 'bold', minWidth: 18, height: 18, lineHeight: 18 },
          tabBarIcon: ({ color, focused }) => (
            <View className={`${focused ? 'bg-green-100' : ''} p-1.5 rounded-full`}>
              <Ionicons name={focused ? "basket" : "basket-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('more'),
          tabBarIcon: ({ color, focused }) => (
            <View className={`${focused ? 'bg-green-100' : ''} p-1.5 rounded-full`}>
              <Ionicons name={focused ? "ellipsis-horizontal" : "ellipsis-horizontal-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
