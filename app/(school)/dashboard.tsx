import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMe } from "@/app/shared/api/auth.query";
import { useDashboardStats } from "@/app/shared/api/dashboard.query";

export default function DashboardScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: stats, isLoading } = useDashboardStats({
    role: me?.role,
    orgId: me?.id ?? null,
  });

  const statItems = [
    {
      label: "Datasets",
      value: stats?.totalDatasets ?? 0,
      icon: "layers-outline" as const,
      color: "#2563EB",
      bg: "bg-blue-50",
    },
    {
      label: "Records",
      value: stats?.totalRecords ?? 0,
      icon: "people-outline" as const,
      color: "#059669",
      bg: "bg-emerald-50",
    },
    {
      label: "Imports",
      value: stats?.totalImports ?? 0,
      icon: "cloud-upload-outline" as const,
      color: "#D97706",
      bg: "bg-amber-50",
    },
    {
      label: "Running",
      value: stats?.runningImports ?? 0,
      icon: "sync-outline" as const,
      color: "#DC2626",
      bg: "bg-red-50",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
      >
        <View className="pt-4 pb-1">
          <Text className="text-2xl font-bold text-black">School Dashboard</Text>
          <Text className="text-gray-400 text-sm mt-0.5">
            A quick snapshot of your import and dataset activity.
          </Text>
        </View>

        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1 mt-4">
          Stats
        </Text>

        <View className="flex-row flex-wrap -mx-1">
          {statItems.map((item) => (
            <View key={item.label} className="w-1/2 px-1 mb-2">
              <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4 min-h-[112px] justify-between">
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center ${item.bg}`}
                >
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View>
                  <Text className="text-gray-400 text-xs font-medium">{item.label}</Text>
                  <Text className="text-black text-2xl font-bold mt-0.5">
                    {isLoading ? "..." : item.value.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1 mt-5">
          Quick Actions
        </Text>

        <Pressable
          className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex-row items-center active:bg-gray-100"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/(school)/import");
          }}
        >
          <View className="w-12 h-12 bg-yellow-100 rounded-xl items-center justify-center">
            <Ionicons name="cloud-upload" size={24} color="#EAB308" />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-black font-semibold text-base">Upload Import</Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              Upload Excel and images ZIP in one flow
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </Pressable>

        <Pressable
          className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex-row items-center active:bg-gray-100 mt-3"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/(school)/datasheet");
          }}
        >
          <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center">
            <Ionicons name="document-text" size={22} color="#2563EB" />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-black font-semibold text-base">Open Datasheet</Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              View and manage your uploaded records
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
