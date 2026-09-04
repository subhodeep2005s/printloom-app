import { colors } from "@/shared/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useState } from "react";
import type { ComponentProps } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export type AuthFieldProps = ComponentProps<typeof TextInput> & {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  helperText?: string | null;
  rightElement?: React.ReactNode;
  secureToggle?: {
    visible: boolean;
    onToggle: () => void;
  };
};

export const AuthField = forwardRef<TextInput, AuthFieldProps>(
  (
    {
      label,
      icon,
      error,
      helperText,
      rightElement,
      secureToggle,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus: NonNullable<ComponentProps<typeof TextInput>["onFocus"]> = (
      e,
    ) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur: NonNullable<ComponentProps<typeof TextInput>["onBlur"]> = (
      e,
    ) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const getBorderColor = () => {
      if (error) return "#EF4444"; // red-500
      if (isFocused) return "#111827"; // gray-900 (ink)
      return "#E5E7EB"; // gray-200
    };

    const getBackgroundColor = () => {
      if (isFocused) return "#FFFFFF";
      return "#F9FAFB"; // gray-50
    };

    return (
      <View className="w-full">
        {label && (
          <Text className="mb-1.5 ml-1 text-sm font-medium text-gray-700">
            {label}
          </Text>
        )}

        <View
          className="flex-row items-center overflow-hidden rounded-xl px-4 py-1"
          style={{
            backgroundColor: getBackgroundColor(),
            borderWidth: 1.5,
            borderColor: getBorderColor(),
          }}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={error ? "#EF4444" : isFocused ? "#111827" : "#9CA3AF"}
              style={{ marginRight: 8 }}
            />
          )}

          <TextInput
            ref={ref}
            className="flex-1 py-3.5 text-base text-gray-900"
            placeholderTextColor="#9CA3AF"
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {rightElement}

          {secureToggle && (
            <Pressable
              hitSlop={15}
              className="ml-2 items-center justify-center p-1"
              onPress={secureToggle.onToggle}
            >
              <Ionicons
                name={secureToggle.visible ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#6B7280"
              />
            </Pressable>
          )}
        </View>

        {error ? (
          <Text className="mt-1.5 ml-1 text-xs font-medium text-red-500">
            {error}
          </Text>
        ) : helperText ? (
          <Text className="mt-1.5 ml-1 text-xs text-gray-500">
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  },
);

AuthField.displayName = "AuthField";
