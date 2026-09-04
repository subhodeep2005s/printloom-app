import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View, Linking, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDashboardStats } from "@/shared/api/dashboard.query";

export default function DashboardScreen() {
  const router = useRouter();
  const { data: stats, isLoading, refetch, isRefetching } = useDashboardStats();

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const statItems = [
    ...(stats?.totalOrganizations != null
      ? [
          {
            label: "Organizations",
            value: stats.totalOrganizations,
            icon: "business-outline" as const,
            accent: "#8B5CF6",
            bg: "bg-violet-50",
            subtitle: `${stats.activeOrganizations ?? 0} active`,
          },
        ]
      : []),
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
        <Text className="text-2xl font-bold text-black">Admin Dashboard</Text>
        <Text className="text-gray-400 text-sm mt-0.5">
          Overview and quick actions
        </Text>
      </View>

      <ScrollView 
        className="px-6 mt-4 flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EAB308" />
        }
      >
        <Pressable 
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex-row items-center active:bg-yellow-100"
          onPress={() => Linking.openURL("https://printloom.in")}
        >
          <View className="bg-yellow-200 w-10 h-10 rounded-full items-center justify-center mr-3">
            <Ionicons name="globe-outline" size={20} color="#CA8A04" />
          </View>
          <View className="flex-1">
             <Text className="text-yellow-800 font-bold text-sm">Visit PrintLoom on Web</Text>
             <Text className="text-yellow-600 text-xs mt-0.5">For a better & complete experience</Text>
          </View>
          <Ionicons name="open-outline" size={16} color="#CA8A04" />
        </Pressable>

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
        
        {isLoading ? (
          <View className="py-10 items-center justify-center">
            <ActivityIndicator size="small" color="#9CA3AF" />
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {statItems.map((item, index) => (
              <View 
                key={index} 
                className="w-[48%] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
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
