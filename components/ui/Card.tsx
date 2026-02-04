import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
    variant?: "elevated" | "outlined" | "flat";
}

export function Card({ children, style, className, variant = "elevated", ...props }: CardProps) {
    const variants = {
        elevated: "bg-white shadow-sm border border-gray-100", // Soft shadow
        outlined: "bg-transparent border border-gray-200",
        flat: "bg-gray-50",
    };

    return (
        <View
            className={`rounded-2xl p-4 ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </View>
    );
}
