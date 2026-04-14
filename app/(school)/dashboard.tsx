import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDashboardStats } from "../shared/api/dashboard.query";

export default function DashboardScreen() {
  const { data: stats, isLoading } = useDashboardStats();

  const statItems = [
    {
      label: "Datasets",
      value: stats?.totalDatasets ?? 0,
      icon: "server-outline" as const,
      accent: "#3B82F6",
      bg: "bg-blue-50",
    },
    {
      label: "Records",
      value: stats?.totalRecords ?? 0,
      icon: "people-outline" as const,
      accent: "#10B981",
      bg: "bg-emerald-50",
    },
    {
      label: "Imports",
      value: stats?.totalImports ?? 0,
      icon: "cloud-upload-outline" as const,
      accent: "#EAB308",
      bg: "bg-yellow-50",
      subtitle: `${stats?.runningImports ?? 0} running`,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4 pb-4">
        <Text className="text-2xl font-bold text-black">School Dashboard</Text>
        <Text className="text-gray-400 text-sm mt-0.5">
          Overview and recent activity
        </Text>
      </View>

      <ScrollView className="px-6 mt-4 flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1">
          Dashboard Stats
        </Text>
        
        {isLoading ? (
          <View className="py-10 items-center justify-center">
            <ActivityIndicator size="small" color="#9CA3AF" />
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-4">
            {statItems.map((item, index) => (
              <View 
                key={index} 
                className="w-[47%] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
              >
                <View className={`w-10 h-10 ${item.bg} rounded-full items-center justify-center mb-3`}>
                  <Ionicons name={item.icon} size={20} color={item.accent} />
                </View>
                <Text className="text-gray-500 text-xs font-medium mb-1">{item.label}</Text>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-2xl font-bold text-gray-900">
                    {item.value.toLocaleString()}
                  </Text>
                  {item.subtitle && (
                    <Text className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                      {item.subtitle}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
