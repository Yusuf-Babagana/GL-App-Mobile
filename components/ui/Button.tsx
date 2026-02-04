import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string; // Allow overrides
}

export function Button({
    title,
    onPress,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    icon,
    className,
}: ButtonProps) {
    const baseStyle = "flex-row items-center justify-center rounded-xl";

    const variants = {
        primary: "bg-primary active:opacity-90 shadow-sm",
        secondary: "bg-transparent border border-gray-200 active:bg-gray-50",
        ghost: "bg-transparent active:bg-gray-50",
        danger: "bg-error active:opacity-90",
    };

    const sizes = {
        sm: "px-3 py-2",
        md: "px-4 py-4",
        lg: "px-6 py-5",
    };

    const textStyles = {
        primary: "text-white font-bold text-base",
        secondary: "text-gray-900 font-semibold text-base",
        ghost: "text-primary font-bold text-base",
        danger: "text-white font-bold text-base",
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            className={`
        ${baseStyle} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${disabled ? "opacity-50" : ""}
        ${className}
      `}
        >
            {loading ? (
                <ActivityIndicator color={variant === "secondary" || variant === "ghost" ? "#329629" : "white"} />
            ) : (
                <>
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text className={textStyles[variant]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}
