import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string;
    fullWidth?: boolean;
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
    fullWidth = true,
}: ButtonProps) {
    const variants = {
        primary: "bg-primary active:opacity-85",
        secondary: "bg-secondary active:opacity-85",
        ghost: "bg-transparent active:bg-gray-50",
        danger: "bg-error active:opacity-85",
        outline: "bg-transparent border-2 border-primary active:bg-primary/5",
    };

    const sizes = {
        sm: "px-5 py-2.5 rounded-xl",
        md: "px-6 py-3.5 rounded-2xl",
        lg: "px-8 py-4.5 rounded-2xl",
    };

    const textStyles = {
        primary: "text-white font-bold text-base",
        secondary: "text-white font-bold text-base",
        ghost: "text-primary font-bold text-base",
        danger: "text-white font-bold text-base",
        outline: "text-primary font-bold text-base",
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            className={`
                ${fullWidth ? "w-full" : ""}
                ${variants[variant]}
                ${sizes[size]}
                ${disabled ? "opacity-45" : ""}
                shadow-sm
                items-center justify-center flex-row
                ${className || ""}
            `}
            style={variant === "primary" ? { shadowColor: '#329629', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 } : {}}
        >
            {loading ? (
                <ActivityIndicator color={variant === "ghost" || variant === "outline" ? "#329629" : "white"} />
            ) : (
                <>
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text className={textStyles[variant]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}
