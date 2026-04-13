import { useLogout, useMe } from "@/app/shared/api/auth.query";
import { useToast } from "@/app/shared/components/Toast";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ORG_LABELS: Record<string, string> = {
  organization: "Organization",
  college: "College",
  university: "University",
  coaching: "Coaching",
  company: "Company",
  ngo: "NGO",
  government: "Government",
  other: "Other",
};

export default function ProfileScreen() {
  const { data: user, isLoading, refetch } = useMe();
  const logout = useLogout();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const onRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setLoggingOut(true);
    try {
      await logout();
      toast.show({ type: "success", title: "Logged Out", message: "See you next time!" });
      router.replace("/(auth)/login");
    } catch {
      toast.show({ type: "error", title: "Error", message: "Failed to log out" });
    } finally {
      setLoggingOut(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#EAB308" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EAB308" />
        }
      >
        {/* Header Title */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-2xl font-bold text-black text-center">Profile</Text>
        </View>

        {/* Avatar Section */}
        <View className="items-center pb-6">
          {/* Avatar Circle */}
          <View className="w-24 h-24 rounded-full bg-yellow-400 items-center justify-center mb-4"
            style={{ shadowColor: "#EAB308", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 }}
          >
            <Text className="text-black text-3xl font-bold">
              {user?.name ? getInitials(user.name) : "?"}
            </Text>
          </View>

          {/* Name & Org Type */}
          <Text className="text-xl font-bold text-black">{user?.name || "—"}</Text>
          {user?.organizationType && (
            <Text className="text-gray-400 text-sm mt-1">
              @{ORG_LABELS[user.organizationType]?.toLowerCase() || user.organizationType}
            </Text>
          )}

          {/* Edit Profile Button */}
          <Pressable
            className="mt-4 bg-black rounded-full px-8 py-2.5 active:bg-gray-800"
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text className="text-yellow-400 font-semibold text-sm">Edit Profile</Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-100 mx-6" />

        {/* Info Fields */}
        <View className="px-6 mt-6">
          <InfoField label="Full name" value={user?.name || "—"} />
          <View style={{ marginTop: 12 }}>
            <View className="flex-row">
              <View className="flex-1 mr-2">
                <InfoField label="Role" value={(user?.role || "—").toUpperCase()} />
              </View>
              <View className="flex-1 ml-2">
                <InfoField
                  label="Joined"
                  value={
                    user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : "—"
                  }
                />
              </View>
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <InfoField label="Phone number" value={user?.mobileNumber || "Not set"} />
          </View>
          <View style={{ marginTop: 12 }}>
            <InfoField label="Email" value={user?.email || "—"} />
          </View>
          <View style={{ marginTop: 12 }}>
            <InfoField
              label="Organization ID"
              value={user?.id || "—"}
              mono
            />
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-100 mx-6 mt-6" />

        {/* Menu Items */}
        <View className="px-6 mt-4">
          <MenuItem
            icon="settings-outline"
            label="Settings"
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          />
          <MenuItem
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          />
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-100 mx-6 mt-2" />

        {/* Logout */}
        <View className="px-6 mt-2 mb-10">
          <Pressable
            className="flex-row items-center py-4 active:opacity-60"
            onPress={handleLogout}
            disabled={loggingOut}
          >
            <View className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center">
              {loggingOut ? (
                <ActivityIndicator color="#EF4444" size="small" />
              ) : (
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              )}
            </View>
            <Text className="text-red-500 font-semibold text-base ml-3">
              {loggingOut ? "Logging out..." : "Log out"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Info Field ─────────────────────────────────────────────

function InfoField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <View className="border border-gray-200 rounded-2xl px-4 py-3.5">
      <Text className="text-xs text-gray-400 mb-0.5">{label}</Text>
      <Text
        className={`text-black text-sm font-medium ${mono ? "font-mono" : ""}`}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Menu Item ──────────────────────────────────────────────

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center py-4 active:opacity-60"
      onPress={onPress}
    >
      <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
        <Ionicons name={icon} size={20} color="#000" />
      </View>
      <Text className="text-black font-medium text-base ml-3 flex-1">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </Pressable>
  );
}
