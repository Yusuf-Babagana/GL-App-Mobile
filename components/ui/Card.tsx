import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
    variant?: "elevated" | "outlined" | "flat";
}

export function Card({ children, style, className, variant = "elevated", ...props }: CardProps) {
    const variants = {
        elevated: "bg-white border border-gray-100/80",
        outlined: "bg-transparent border-2 border-gray-100",
        flat: "bg-gray-50",
    };

    return (
        <View
            className={`rounded-3xl p-5 ${variants[variant]} ${className || ""}`}
            style={variant === "elevated" ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
            } : {}}
            {...props}
        >
            {children}
        </View>
    );
}
