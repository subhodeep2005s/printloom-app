import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4 pb-4">
        <Text className="text-2xl font-bold text-black">Admin Dashboard</Text>
        <Text className="text-gray-400 text-sm mt-0.5">
          Overview and quick actions
        </Text>
      </View>

      <View className="px-6 mt-4 flex-1">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1">
          Quick Actions
        </Text>

        <Pressable
          className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex-row items-center active:bg-gray-100"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/(admin)/import");
          }}
        >
          <View className="w-12 h-12 bg-yellow-100 rounded-xl items-center justify-center">
            <Ionicons name="cloud-upload" size={24} color="#EAB308" />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-black font-semibold text-base">Import Data</Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              Upload spreadsheets and images ZIP
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </Pressable>

        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1 mt-8">
          Dashboard Stats
        </Text>
        
        <View className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-8 items-center justify-center">
          <View className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="bar-chart" size={28} color="#D1D5DB" />
          </View>
          <Text className="text-gray-800 font-bold text-base mb-1">Coming Soon</Text>
          <Text className="text-gray-400 text-center text-sm px-4">
            Detailed analytics, organization metrics, and printing statistics will be available here in the upcoming release.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
