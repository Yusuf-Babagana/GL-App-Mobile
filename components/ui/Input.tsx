import React, { forwardRef } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
    ({ label, error, containerStyle, className, ...props }, ref) => {
        return (
            <View className={`mb-5 ${containerStyle || ""}`}>
                {label && (
                    <Text className="text-gray-700 font-bold text-xs mb-2 uppercase tracking-widest">
                        {label}
                    </Text>
                )}
                <TextInput
                    ref={ref}
                    placeholderTextColor="#A0AEC0"
                    className={`
                        bg-gray-50 border-2 border-gray-100
                        rounded-2xl px-5 py-4
                        text-gray-900 text-base font-semibold
                        focus:border-primary focus:bg-white
                        ${error ? "border-error" : ""}
                        ${className || ""}
                    `}
                    {...props}
                />
                {error && <Text className="text-error text-sm font-medium mt-1.5 ml-1">{error}</Text>}
            </View>
        );
    }
);
