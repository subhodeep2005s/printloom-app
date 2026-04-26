import { colors } from "@/app/shared/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import type { ReactNode } from "react";
import type { ImageSourcePropType } from "react-native";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  eyebrow?: string;
  heroImage?: ImageSourcePropType;
  footer?: ReactNode;
  backButton?: boolean;
};

export function AuthShell({
  children,
  title,
  subtitle,
  eyebrow,
  heroImage,
  footer,
  backButton = false,
}: AuthShellProps) {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.surface }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 px-5 pb-8 pt-2">
            {backButton ? (
              <View className="mb-3 flex-row items-center">
                <Pressable
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border }}
                  onPress={() => router.back()}
                >
                  <Ionicons name="arrow-back" size={18} color={colors.ink} />
                </Pressable>
              </View>
            ) : null}

            <View
              className="overflow-hidden rounded-[32px] px-6 pb-6 pt-5"
              style={{
                backgroundColor: colors.surfaceStrong,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 16 },
                elevation: 8,
              }}
            >
              <View
                className="absolute -right-12 -top-10 h-40 w-40 rounded-full"
                style={{ backgroundColor: colors.goldSoft, opacity: 0.9 }}
              />
              <View
                className="absolute -left-10 top-28 h-24 w-24 rounded-full"
                style={{ backgroundColor: colors.sand, opacity: 0.9 }}
              />

              {heroImage ? (
                <View className="mb-5 items-center">
                  <Image
                    source={heroImage}
                    contentFit="contain"
                    style={{ width: 250, height: 190 }}
                  />
                </View>
              ) : null}

              {eyebrow ? (
                <View
                  className="self-start rounded-full px-3 py-1"
                  style={{ backgroundColor: colors.sand }}
                >
                  <Text
                    className="text-xs font-semibold uppercase tracking-[1px]"
                    style={{ color: colors.goldDeep }}
                  >
                    {eyebrow}
                  </Text>
                </View>
              ) : null}

              <Text className="mt-4 text-[30px] font-bold leading-9" style={{ color: colors.ink }}>
                {title}
              </Text>
              <Text className="mt-2 text-[15px] leading-6" style={{ color: colors.inkSoft }}>
                {subtitle}
              </Text>

              <View className="mt-7">{children}</View>
            </View>

            {footer ? <View className="px-2 pt-6">{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
