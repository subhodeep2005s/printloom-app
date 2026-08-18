import {
    useDeleteOrganization,
    useOrganizations,
    useUpdateOrganization,
} from "@/app/shared/api/auth.query";
import { useToast } from "@/app/shared/components/Toast";
import { OrganizationDto } from "@/app/shared/types/auth/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrganizationsScreen() {
  const { data: organizations, isLoading, refetch } = useOrganizations();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationDto | null>(null);

  const onRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-4 pb-3">
        <Text className="text-2xl font-bold text-black">Organizations</Text>
        <Text className="text-gray-400 text-sm mt-0.5">
          Manage all registered organizations
        </Text>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#EAB308" size="large" />
        </View>
      ) : !organizations || organizations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="business-outline" size={28} color="#9CA3AF" />
          </View>
          <Text className="text-gray-500 font-semibold text-base">No organizations found</Text>
        </View>
      ) : (
        <FlatList
          data={organizations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <OrganizationCard
              org={item}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setSelectedOrg(item);
              }}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EAB308" />
          }
        />
      )}

      {selectedOrg && (
        <OrgEditModal
          org={selectedOrg}
          onClose={() => setSelectedOrg(null)}
          onUpdated={() => refetch()}
        />
      )}
    </SafeAreaView>
  );
}

function OrganizationCard({ org, onPress }: { org: OrganizationDto; onPress: () => void }) {
  return (
    <Pressable
      className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 flex-row items-center active:bg-gray-100"
      onPress={onPress}
    >
      <View className="w-12 h-12 rounded-xl bg-gray-200 items-center justify-center">
        <Text className="text-gray-500 font-bold text-lg">
          {(org.name ?? "?").charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-black font-semibold text-base" numberOfLines={1}>
          {org.name}
        </Text>
        <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
          {org.email} • {org.organization_type}
        </Text>
      </View>
      <View
        className={`px-2 py-0.5 rounded-lg ${
          org.is_active ? "bg-green-100" : "bg-red-100"
        }`}
      >
        <Text
          className={`text-xs font-semibold ${
            org.is_active ? "text-green-700" : "text-red-700"
          }`}
        >
          {org.is_active ? "Active" : "Inactive"}
        </Text>
      </View>
    </Pressable>
  );
}

function OrgEditModal({
  org,
  onClose,
  onUpdated,
}: {
  org: OrganizationDto;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [form, setForm] = useState({
    name: org.name ?? "",
    email: org.email,
    organizationType: org.organization_type ?? "organization",
    isActive: org.is_active,
  });

  const toast = useToast();
  const { mutate: updateOrg, isPending: saving } = useUpdateOrganization();
  const { mutate: deleteOrg, isPending: deleting } = useDeleteOrganization();

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    updateOrg(
      { orgId: org.id, data: form },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.show({ type: "success", title: "Saved", message: "Organization updated" });
          onUpdated();
          onClose();
        },
        onError: (err: any) => {
          toast.show({
            type: "error",
            title: "Error",
            message: err?.response?.data?.message || "Failed to update",
          });
        },
      }
    );
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteOrg(org.id, {
      onSuccess: () => {
        toast.show({ type: "success", title: "Deleted", message: "Organization deleted" });
        onUpdated();
        onClose();
      },
      onError: (err: any) => {
        toast.show({
          type: "error",
          title: "Error",
          message: err?.response?.data?.message || "Failed to delete",
        });
      },
    });
  };

  return (
    <Modal visible animationType="slide">
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Top Bar */}
          <View className="flex-row items-center justify-between px-6 pt-3 pb-2">
            <Pressable
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onClose();
              }}
            >
              <Ionicons name="close" size={20} color="#000" />
            </Pressable>
            <Text className="text-lg font-bold text-black">Edit Organization</Text>
            <View className="w-10" />
          </View>

          <ScrollView className="px-6 py-4 flex-1">
            {/* Read-only info */}
            <View className="bg-gray-50 rounded-2xl px-4 py-3 mb-4 border border-gray-100">
              <Text className="text-xs text-gray-400 font-medium mb-1">Organization ID</Text>
              <Text className="text-xs text-gray-600 font-mono" selectable>{org.id}</Text>
            </View>

            {org.created_at && (
              <View className="bg-gray-50 rounded-2xl px-4 py-3 mb-4 border border-gray-100">
                <Text className="text-xs text-gray-400 font-medium mb-1">Registered On</Text>
                <Text className="text-sm text-gray-700">
                  {new Date(org.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-xs text-gray-400 font-medium mb-2 ml-1">Name</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3.5 text-black"
                value={form.name}
                onChangeText={(val) => setForm((p) => ({ ...p, name: val }))}
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs text-gray-400 font-medium mb-2 ml-1">Email</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3.5 text-black"
                value={form.email}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={(val) => setForm((p) => ({ ...p, email: val }))}
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs text-gray-400 font-medium mb-2 ml-1">Org Type</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-3.5 text-black"
                value={form.organizationType}
                onChangeText={(val) => setForm((p) => ({ ...p, organizationType: val }))}
              />
            </View>

            <View className="mb-8 flex-row items-center mt-2">
              <Text className="text-sm font-medium text-black flex-1">Is Active</Text>
              <Pressable
                className={`w-12 h-6 rounded-full px-1 justify-center ${
                  form.isActive ? "bg-yellow-400" : "bg-gray-300"
                }`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setForm((p) => ({ ...p, isActive: !p.isActive }));
                }}
              >
                <View
                  className={`w-4 h-4 bg-white rounded-full transition-all ${
                    form.isActive ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </Pressable>
            </View>

            <Pressable
              className={`rounded-2xl py-4 items-center ${
                saving ? "bg-gray-800" : "bg-black"
              }`}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#EAB308" />
              ) : (
                <Text className="text-yellow-400 font-bold text-base">Save Changes</Text>
              )}
            </Pressable>

            <View className="h-px bg-gray-100 my-6" />

            <Pressable
              className={`bg-red-50 rounded-2xl py-4 items-center flex-row justify-center active:bg-red-100 ${
                deleting ? "opacity-50" : ""
              }`}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color="#EF4444" size="small" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text className="text-red-500 font-semibold text-base ml-2">
                    Delete Organization
                  </Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
