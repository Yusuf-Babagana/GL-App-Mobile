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
            <View className={`mb-4 ${containerStyle}`}>
                {label && (
                    <Text className="text-gray-900 font-medium mb-1.5 text-base">
                        {label}
                    </Text>
                )}
                <TextInput
                    ref={ref}
                    placeholderTextColor="#9CA3AF"
                    className={`
            bg-gray-50 border border-gray-200 
            rounded-xl px-4 py-3.5
            text-gray-900 text-base
            focus:border-primary focus:bg-white
            ${error ? "border-error" : ""}
            ${className}
          `}
                    {...props}
                />
                {error && <Text className="text-error text-sm mt-1">{error}</Text>}
            </View>
        );
    }
);
