import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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

  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="(school)" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
