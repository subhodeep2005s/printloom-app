import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "./shared/components/Toast";

import "../global.css";
import { queryClient } from "./lib/queryClient";
import setupQueryPersistence from "./lib/queryPersist";
import { colors } from "./shared/constants/theme";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setupQueryPersistence();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");

        const inAuthGroup = segments[0] === "(auth)";

        if (!token && !inAuthGroup) {
          router.replace("/(auth)/login");
          return;
        }

        if (token && inAuthGroup) {
          router.replace("/");
          return;
        }
      } catch (error) {
        if (__DEV__) console.error("Auth check error:", error);
      } finally {
        setIsReady(true);
      }
    };

    if (segments.length > 0) {
      checkAuth();
    } else {
      setIsReady(true);
    }
  }, [router, segments]);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <StatusBar style="dark" />
        <View
          style={{
            position: "absolute",
            top: 110,
            width: 180,
            height: 180,
            borderRadius: 999,
            backgroundColor: colors.goldSoft,
            opacity: 0.8,
          }}
        />
        <Image
          source={require("../assets/images/icon.png")}
          style={{ width: 132, height: 132, marginBottom: 24 }}
          contentFit="contain"
        />
        <ActivityIndicator size="large" color={colors.goldDeep} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <View style={{ flex: 1, backgroundColor: colors.surface }}>
          <StatusBar style="dark" />
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(admin)" />
              <Stack.Screen name="(school)" />
            </Stack>
          </QueryClientProvider>
        </View>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
