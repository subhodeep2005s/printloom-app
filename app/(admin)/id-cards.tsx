import { useOrganizations } from "@/shared/api/auth.query";
import { useDatasets } from "@/shared/api/dataset.query";
import { usePrintDataset, useTemplates } from "@/shared/api/print.query";
import { useToast } from "@/shared/components/Toast";
import { OrganizationDto } from "@/shared/types/auth/types";
import { DatasetDto } from "@/shared/types/dataset/types";
import { TemplateDto } from "@/shared/types/print/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    ActivityIndicator,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IdCardsScreen() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const [showOrgPicker, setShowOrgPicker] = useState(false);
  const [showDatasetPicker, setShowDatasetPicker] = useState(false);

  const toast = useToast();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const { data: orgsData, isLoading: orgsLoading } = useOrganizations();
  const orgs = useMemo(() => orgsData ?? [], [orgsData]);

  useEffect(() => {
    if (!selectedOrgId && orgs.length > 0) {
      setSelectedOrgId(orgs[0].id);
    }
  }, [orgs, selectedOrgId]);

  const currentOrg = orgs.find((o) => o.id === selectedOrgId) ?? null;

  const { data: datasetsData, isLoading: datasetsLoading } = useDatasets(selectedOrgId);
  const datasets = useMemo(() => datasetsData?.items ?? [], [datasetsData]);

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

  const {
    data: templates,
    isLoading: templatesLoading,
  } = useTemplates(selectedOrgId || undefined, selectedDatasetId || undefined);
  const { mutate: doPrint, isPending: isPrinting } = usePrintDataset();

  useEffect(() => {
    if (!templates?.length) {
      setSelectedTemplateId(null);
      return;
    }

    if (selectedTemplateId && !templates.some((template) => template.id === selectedTemplateId)) {
      setSelectedTemplateId(null);
    }
  }, [selectedTemplateId, templates]);

  const selectedTemplate = templates?.find((template) => template.id === selectedTemplateId) ?? null;

  const handlePrint = async () => {
    if (!selectedOrgId || !selectedDatasetId || !selectedTemplateId) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!templates || templates.length === 0) {
      toast.show({
        type: "error",
        title: "No Template Found",
        message: "No templates exist for this dataset. Please create a template from the web dashboard first.",
      });
      return;
    }

    doPrint(
      {
        datasetId: selectedDatasetId,
        data: {
          templateId: selectedTemplateId,
          orgId: selectedOrgId,
          page: 1,
          pageSize: 500,
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
                  } catch (error) {
                    console.error("Write error:", error);
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
                      } catch (error) {
                        console.error('SAF error:', error);
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
                      } catch {}
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

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EAB308" />
        }
      >
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

        {/* Template Status */}
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
              • {templatesLoading ? (
                "Loading templates..."
              ) : templates && templates.length > 0 ? (
                <Text>
                  {templates.length} templates found.{" "}
                  <Text className="font-bold">
                    {selectedTemplate ? `Selected: ${selectedTemplate.name}` : "Select one to continue."}
                  </Text>
                </Text>
              ) : (
                <Text className="text-red-500 font-bold">No template available. Create one to print.</Text>
              )}
            </Text>
          </View>
        )}

        {/* Template Picker */}
        {selectedDatasetId ? (
          <View className="mb-8">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1">
              Available Templates
            </Text>

            {templatesLoading ? (
              <View className="py-8 items-center justify-center">
                <ActivityIndicator color="#EAB308" />
                <Text className="text-gray-400 text-sm mt-2">Loading templates...</Text>
              </View>
            ) : templates && templates.length > 0 ? (
              <View className="gap-4">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={selectedTemplateId === template.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedTemplateId(template.id);
                    }}
                  />
                ))}
              </View>
            ) : (
              <View className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                <Text className="text-black font-semibold">No templates for this dataset</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Create a template first, then come back to generate the ZIP.
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Action Button */}
        {selectedDatasetId && (
          <Pressable
            className={`rounded-2xl py-4 items-center flex-row justify-center ${
              isPrinting || !selectedTemplateId ? "bg-gray-800" : "bg-black"
            }`}
            onPress={handlePrint}
            disabled={isPrinting || !selectedTemplateId}
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
                  {selectedTemplateId ? "Print Data & Download ZIP" : "Select a Template First"}
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

function TemplateCard({
  template,
  selected,
  onPress,
}: {
  template: TemplateDto;
  selected: boolean;
  onPress: () => void;
}) {
  const backgroundImage = template.canvas.backgroundImage;
  const imageCount = template.canvas.elements.filter((element) => element.type === "image").length;
  const textCount = template.canvas.elements.filter((element) => element.type === "text").length;

  return (
    <Pressable
      className={`rounded-2xl border p-4 ${selected ? "bg-yellow-50 border-yellow-400" : "bg-white border-gray-200"}`}
      onPress={onPress}
    >
      <View className="flex-row items-start">
        <View className="w-24 h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
          {backgroundImage ? (
            <Image
              source={{ uri: backgroundImage }}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="image-outline" size={24} color="#9CA3AF" />
            </View>
          )}
        </View>

        <View className="flex-1 ml-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-black flex-1 pr-3">{template.name}</Text>
            {selected ? (
              <View className="w-7 h-7 rounded-full bg-yellow-400 items-center justify-center">
                <Ionicons name="checkmark" size={16} color="#111827" />
              </View>
            ) : null}
          </View>

          <View className="flex-row flex-wrap mt-2 gap-2">
            {template.isDefault ? (
              <View className="bg-yellow-100 px-2.5 py-1 rounded-full">
                <Text className="text-yellow-800 text-xs font-semibold">Default</Text>
              </View>
            ) : null}
            <View className="bg-gray-100 px-2.5 py-1 rounded-full">
              <Text className="text-gray-700 text-xs font-semibold">
                {template.canvas.width} x {template.canvas.height}
              </Text>
            </View>
          </View>

          <Text className="text-gray-500 text-sm mt-3">
            {textCount} text fields, {imageCount} image fields
          </Text>
          <Text className="text-gray-400 text-xs mt-1">
            Updated {new Date(template.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>
    </Pressable>
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
