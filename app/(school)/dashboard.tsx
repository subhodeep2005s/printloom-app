import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function dashboard() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <Text className="text-2xl font-bold">Coming Soon</Text>
      <Text className="text-lg text-gray-600 mt-2">School Dashboard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
