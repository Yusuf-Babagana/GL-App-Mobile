import React from "react";
import { StatusBar, View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenWrapperProps extends ViewProps {
    bg?: string;
    safeAreaTop?: boolean;
    safeAreaBottom?: boolean;
}

export function ScreenWrapper({
    children,
    bg = "bg-white",
    safeAreaTop = true,
    safeAreaBottom = false,
    className,
    ...props
}: ScreenWrapperProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            className={`flex-1 ${bg} ${className}`}
            style={{
                paddingTop: safeAreaTop ? insets.top : 0,
                paddingBottom: safeAreaBottom ? insets.bottom : 0
            }}
            {...props}
        >
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            {children}
        </View>
    );
}
