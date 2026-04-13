import { useOrganizations } from "@/app/shared/api/auth.query";
import { useDatasets } from "@/app/shared/api/dataset.query";
import { usePrintDataset, useTemplates } from "@/app/shared/api/print.query";
import { useToast } from "@/app/shared/components/Toast";
import { OrganizationDto } from "@/app/shared/types/auth/types";
import { DatasetDto } from "@/app/shared/types/dataset/types";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IdCardsScreen() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);

  const [showOrgPicker, setShowOrgPicker] = useState(false);
  const [showDatasetPicker, setShowDatasetPicker] = useState(false);

  const toast = useToast();

  const { data: orgsData, isLoading: orgsLoading } = useOrganizations();
  const orgs = orgsData || [];

  useEffect(() => {
    if (!selectedOrgId && orgs.length > 0) {
      setSelectedOrgId(orgs[0].id);
    }
  }, [orgs, selectedOrgId]);

  const currentOrg = orgs.find((o) => o.id === selectedOrgId) ?? null;

  const { data: datasetsData, isLoading: datasetsLoading } = useDatasets(selectedOrgId);
  const datasets = datasetsData?.items ?? [];

  useEffect(() => {
    if (datasets.length > 0) {
      if (!selectedDatasetId || !datasets.find((d) => d.id === selectedDatasetId)) {
        setSelectedDatasetId(datasets[0].id);
      }
    } else {
      setSelectedDatasetId(null);
    }
  }, [datasets, selectedDatasetId]);

  const currentDataset = datasets.find((d) => d.id === selectedDatasetId) ?? null;

  const { data: templates } = useTemplates(selectedOrgId || undefined, selectedDatasetId || undefined);
  const { mutate: doPrint, isPending: isPrinting } = usePrintDataset();

  const handlePrint = async () => {
    if (!selectedOrgId || !selectedDatasetId) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!templates || templates.length === 0) {
      toast.show({
        type: "error",
        title: "No Template Found",
        message: "No templates exist for this dataset. Please create a template from the web dashboard first.",
      });
      return;
    }

    const defaultTemplate = templates.find((t) => t.isDefault) || templates[0];

    doPrint(
      {
        datasetId: selectedDatasetId,
        data: {
          templateId: defaultTemplate.id,
          orgId: selectedOrgId,
          page: 1,
          pageSize: 500, // Or whatever limit fits
        },
      },
      {
        onSuccess: async (res) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.show({
            type: "success",
            title: "Print Generated",
            message: "Saving ZIP archive...",
          });

          try {
            if (Platform.OS === "web") {
              // Web: Handle Blob or Base64 or URL
              const url = res instanceof Blob 
                ? window.URL.createObjectURL(res) 
                : typeof res === "string" && res.startsWith("http")
                  ? res
                  : `data:application/zip;base64,${res}`;
                  
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", `id_cards_${selectedDatasetId}.zip`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else {
              // Mobile: Use expo-file-system
              let fileUri = "";
              const targetPath = `${FileSystem.documentDirectory}id_cards_${selectedDatasetId}_${Date.now()}.zip`;

                const saveBase64 = async (b64: string, path: string) => {
                  try {
                    await FileSystem.writeAsStringAsync(path, b64, { encoding: "base64" });
                  } catch (e) {
                    console.error("Write error:", e);
                  }
                };

                if (res instanceof Blob) {
                  const reader = new FileReader();
                  reader.readAsDataURL(res);
                  reader.onloadend = async () => {
                    const base64data = (reader.result as string).split(",")[1];

                    if (Platform.OS === 'android') {
                      try {
                        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                        if (permissions.granted) {
                          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                            permissions.directoryUri,
                            `id_cards_${selectedDatasetId}_${Date.now()}.zip`,
                            'application/zip'
                          );
                          await saveBase64(base64data, fileUri);
                          toast.show({ type: "success", title: "Saved", message: "ZIP saved to Documents/Downloads" });
                          return;
                        }
                      } catch (e) {
                        console.error('SAF error:', e);
                      }
                    }

                    // Fallback to Share
                    await saveBase64(base64data, targetPath);
                    await handleShare(targetPath);
                  };
                  return;
                } else if (typeof res === "string" && res.startsWith("http")) {
                  const downloadResult = await FileSystem.downloadAsync(res, targetPath);
                  fileUri = downloadResult.uri;
                } else if (typeof res === "string") {
                  if (Platform.OS === 'android') {
                      try {
                        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                        if (permissions.granted) {
                          const uri = await FileSystem.StorageAccessFramework.createFileAsync(
                            permissions.directoryUri,
                            `id_cards_${selectedDatasetId}_${Date.now()}.zip`,
                            'application/zip'
                          );
                          await saveBase64(res, uri);
                          toast.show({ type: "success", title: "Saved", message: "ZIP saved to your directory" });
                          return;
                        }
                      } catch (e) {}
                  }

                  await saveBase64(res, targetPath);
                  fileUri = targetPath;
                } 

                if (fileUri) {
                  await handleShare(fileUri);
                }
              }

          } catch (e: any) {
            toast.show({
              type: "error",
              title: "Save Failed",
              message: e.message || "Could not save the file.",
            });
          }
        },
        onError: (err: any) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          toast.show({
            type: "error",
            title: "Print Failed",
            message: err?.response?.data?.message || err?.message || "Failed to generate print.",
          });
        },
      }
    );
  };

  const handleShare = async (uri: string) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/zip",
        dialogTitle: "Save ID Cards ZIP to Downloads",
      });
      toast.show({
        type: "success",
        title: "Success",
        message: "File is ready! Please select 'Save to Files' or 'Downloads'",
      });
    } else {
      toast.show({
        type: "error",
        title: "Error",
        message: "Sharing not available on this device",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-4 pb-4">
        <Text className="text-2xl font-bold text-black">ID Cards Print</Text>
        <Text className="text-gray-400 text-sm mt-0.5">
          Generate ID Cards for a dataset
        </Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Org Selector */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
            Organization
          </Text>
          <Pressable
            className="bg-gray-50 rounded-2xl px-4 py-4 flex-row items-center active:bg-gray-100 border border-gray-100"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowOrgPicker(true);
            }}
          >
            <View className="w-10 h-10 bg-gray-200 rounded-xl items-center justify-center">
              <Ionicons name="business" size={18} color="#9CA3AF" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-black font-semibold text-sm" numberOfLines={1}>
                {orgsLoading ? "Loading..." : currentOrg?.name ?? "Select Organization"}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Dataset Selector */}
        <View className="mb-6">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
            Dataset
          </Text>
          <Pressable
            className={`bg-gray-50 rounded-2xl px-4 py-4 flex-row items-center border border-gray-100 ${
              !selectedOrgId ? "opacity-50" : "active:bg-gray-100"
            }`}
            disabled={!selectedOrgId}
            onPress={() => {
              if (datasets.length > 0) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowDatasetPicker(true);
              }
            }}
          >
            <View className="w-10 h-10 bg-yellow-100 rounded-xl items-center justify-center">
              <Ionicons name="grid" size={18} color="#EAB308" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-black font-semibold text-sm" numberOfLines={1}>
                {datasetsLoading
                  ? "Loading..."
                  : currentDataset?.name ?? "Select Dataset"}
              </Text>
              {currentDataset && (
                <Text className="text-gray-400 text-xs mt-0.5">
                  {currentDataset.totalRecords} records found
                </Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Preview / Template Status */}
        {selectedDatasetId && currentDataset && (
          <View className="mb-8 p-5 bg-yellow-50 rounded-2xl border border-yellow-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle-outline" size={20} color="#CA8A04" />
              <Text className="text-yellow-800 font-semibold text-sm ml-2">Print Info</Text>
            </View>
            <Text className="text-yellow-700 text-sm mb-1 mt-2">
              • Dataset has <Text className="font-bold">{currentDataset.totalRecords}</Text> eligible records.
            </Text>
            <Text className="text-yellow-700 text-sm">
              • {templates && templates.length > 0 ? (
                <Text>Using default template: <Text className="font-bold">{templates.find(t => t.isDefault)?.name || templates[0].name}</Text></Text>
              ) : (
                <Text className="text-red-500 font-bold">No template available. Create one to print.</Text>
              )}
            </Text>
          </View>
        )}

        {/* Action Button */}
        {selectedDatasetId && (
          <Pressable
            className={`rounded-2xl py-4 items-center flex-row justify-center ${
              isPrinting ? "bg-gray-800" : "bg-black"
            }`}
            onPress={handlePrint}
            disabled={isPrinting}
          >
            {isPrinting ? (
              <>
                <ActivityIndicator color="#EAB308" size="small" />
                <Text className="text-yellow-400 font-bold text-base ml-2">
                  Generating Print ZIP...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="print" size={20} color="#EAB308" />
                <Text className="text-yellow-400 font-bold text-base ml-2">
                  Print Data & Download ZIP
                </Text>
              </>
            )}
          </Pressable>
        )}
      </ScrollView>

      {/* Pickers */}
      <OrgPickerModal
        visible={showOrgPicker}
        onClose={() => setShowOrgPicker(false)}
        orgs={orgs}
        selectedId={selectedOrgId}
        onSelect={(id) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedOrgId(id);
          setSelectedDatasetId(null);
          setShowOrgPicker(false);
        }}
      />

      <DatasetPickerModal
        visible={showDatasetPicker}
        onClose={() => setShowDatasetPicker(false)}
        datasets={datasets}
        selectedId={selectedDatasetId}
        onSelect={(id) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedDatasetId(id);
          setShowDatasetPicker(false);
        }}
      />
    </SafeAreaView>
  );
}

// ─── Pickers ───────────────────────────────────

function DatasetPickerModal({
  visible, onClose, datasets, selectedId, onSelect,
}: {
  visible: boolean; onClose: () => void; datasets: DatasetDto[]; selectedId: string | null; onSelect: (id: string) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl max-h-[60%]">
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 bg-gray-300 rounded-full" />
          </View>
          <View className="flex-row items-center justify-between px-6 pb-3">
            <Text className="text-lg font-bold text-black">Select Dataset</Text>
            <Pressable onPress={onClose} className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
              <Ionicons name="close" size={18} color="#000" />
            </Pressable>
          </View>
          <ScrollView className="px-6 pb-8">
            {datasets.map((ds) => {
              const isSelected = ds.id === selectedId;
              return (
                <Pressable
                  key={ds.id}
                  className={`rounded-2xl px-4 py-4 flex-row items-center mt-2 ${isSelected ? "bg-yellow-50 border border-yellow-300" : "bg-gray-50"}`}
                  onPress={() => onSelect(ds.id)}
                >
                  <View className={`w-10 h-10 rounded-xl items-center justify-center ${isSelected ? "bg-yellow-400" : "bg-gray-200"}`}>
                    <Ionicons name="grid" size={18} color={isSelected ? "#000" : "#9CA3AF"} />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-black font-semibold text-sm">{ds.name}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark" size={18} color="#EAB308" />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function OrgPickerModal({
  visible, onClose, orgs, selectedId, onSelect,
}: {
  visible: boolean; onClose: () => void; orgs: OrganizationDto[]; selectedId: string | null; onSelect: (id: string) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl max-h-[60%]">
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 bg-gray-300 rounded-full" />
          </View>
          <View className="flex-row items-center justify-between px-6 pb-3">
            <Text className="text-lg font-bold text-black">Select Organization</Text>
            <Pressable onPress={onClose} className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
              <Ionicons name="close" size={18} color="#000" />
            </Pressable>
          </View>
          <ScrollView className="px-6 pb-8">
            {orgs.map((org) => {
              const isSelected = org.id === selectedId;
              return (
                <Pressable
                  key={org.id}
                  className={`rounded-2xl px-4 py-4 flex-row items-center mt-2 ${isSelected ? "bg-gray-100 border border-gray-300" : "bg-gray-50"}`}
                  onPress={() => onSelect(org.id)}
                >
                  <View className="flex-1">
                    <Text className="text-black font-semibold text-sm" numberOfLines={1}>{org.name}</Text>
                    <Text className="text-gray-400 text-xs mt-0.5">{org.email}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark" size={18} color="#000" />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
