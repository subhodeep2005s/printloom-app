import { queryClient } from "@/app/lib/queryClient";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";

import { Alert, Text, TouchableOpacity, View } from "react-native";
export default function Profile() {
  queryClient.clear();
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("access_token");

      Alert.alert("Logged out", "You have been logged out successfully.");
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold">Profile</Text>

      <TouchableOpacity
        onPress={handleLogout}
        className="mt-4 px-4 py-2 bg-red-500 rounded"
      >
        <Text className="text-white font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
