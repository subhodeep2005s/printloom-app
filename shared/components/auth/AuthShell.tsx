import { colors } from "@/shared/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
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
  showTermsNotice?: boolean;
};

export function AuthShell({
  children,
  title,
  subtitle,
  eyebrow,
  heroImage,
  footer,
  backButton = false,
  showTermsNotice = true,
}: AuthShellProps) {
  const openTerms = () => {
    WebBrowser.openBrowserAsync("https://printloom.in/terms").catch(() => {});
  };

  const openPrivacy = () => {
    WebBrowser.openBrowserAsync("https://printloom.in/privacy").catch(() => {});
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: "#FFFFFF" }}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 px-6 pb-10 pt-4">
            {/* Simple Top Navigation */}
            {backButton && (
              <Pressable
                hitSlop={20}
                className="mb-6 h-10 w-10 items-center justify-center rounded-full bg-gray-50 active:bg-gray-100"
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace("/(auth)/login");
                  }
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#111827" />
              </Pressable>
            )}

            {!backButton && <View className="mt-8" />}

            {/* Header Section */}
            {eyebrow && (
              <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                {eyebrow}
              </Text>
            )}
            <Text className="text-[32px] font-bold tracking-tight text-gray-900">
              {title}
            </Text>
            <Text className="mt-2 text-base leading-6 text-gray-500">
              {subtitle}
            </Text>

            {heroImage && (
              <View className="my-6 items-center justify-center">
                <Image
                  source={heroImage}
                  contentFit="contain"
                  style={{ width: "100%", height: 180 }}
                />
              </View>
            )}

            {!heroImage && <View className="mt-8" />}

            {/* Form Content */}
            <View className="flex-1">
              {children}
            </View>

            {/* Footer */}
            {footer && <View className="mt-8">{footer}</View>}

            {/* Terms and Privacy */}
            {showTermsNotice && (
              <View className="mt-6 px-4">
                <Text className="text-center text-xs leading-5 text-gray-400">
                  By continuing, you agree to PrintLoom's{" "}
                  <Text
                    onPress={openTerms}
                    className="font-medium text-gray-600 underline"
                  >
                    Terms
                  </Text>{" "}
                  and{" "}
                  <Text
                    onPress={openPrivacy}
                    className="font-medium text-gray-600 underline"
                  >
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
