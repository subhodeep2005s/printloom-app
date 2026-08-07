import { colors } from "@/app/shared/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type AuthFieldProps = ComponentProps<typeof TextInput> & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  secureToggle?: {
    visible: boolean;
    onToggle: () => void;
  };
};

export function AuthField({
  label,
  icon,
  error,
  secureToggle,
  ...props
}: AuthFieldProps) {
  return (
    <View>
      <Text className="mb-2 text-sm font-semibold" style={{ color: colors.ink }}>
        {label}
      </Text>
      <View
        className="flex-row items-center rounded-[22px] px-4 py-1"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: error ? "#FCA5A5" : colors.border,
        }}
      >
        <Ionicons name={icon} size={18} color={colors.goldDeep} />
        <TextInput
          {...props}
          className="flex-1 px-3 py-4 text-[15px]"
          placeholderTextColor="#9CA3AF"
          style={{ color: colors.ink }}
        />
        {secureToggle ? (
          <Pressable
            className="rounded-full px-3 py-2"
            onPress={secureToggle.onToggle}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.goldDeep }}>
              {secureToggle.visible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className="mt-2 text-xs" style={{ color: colors.danger }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
