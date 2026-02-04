import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function RiderLayout() {
    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <StatusBar style="light" backgroundColor="#111827" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#F9FAFB' },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="dashboard" options={{ animation: 'fade' }} />
            </Stack>
        </View>
    );
}
