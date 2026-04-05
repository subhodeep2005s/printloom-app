import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { queryClient } from "../lib/queryClient";
export default function print() {
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("access_token");
      queryClient.clear();
      Alert.alert("Logged out", "You have been logged out successfully.");
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };
  return (
    <View>
      <Text>print</Text>

      <TouchableOpacity
        onPress={handleLogout}
        className="mt-4 px-4 py-2 bg-red-500 rounded"
      >
        <Text className="text-white font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
