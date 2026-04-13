import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "./shared/components/Toast";

import { Image, ActivityIndicator, View } from "react-native";
import "../global.css";
import { queryClient } from "./lib/queryClient";
import setupQueryPersistence from "./lib/queryPersist";

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
        const inAdminGroup = segments[0] === "(admin)";
        const inSchoolGroup = segments[0] === "(school)";

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
  }, [segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: "#ffffff", justifyContent: "center", alignItems: "center" }}>
        <StatusBar style="dark" />
        <Image
          source={require("../assets/images/icon.png")}
          style={{ width: 140, height: 140, marginBottom: 32, borderRadius: 32 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#EAB308" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
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
