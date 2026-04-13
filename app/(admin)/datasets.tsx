import {
  useOrganizations,
} from "@/app/shared/api/auth.query";
import {
  useDatasets,
  useRecords,
  useDeleteRecord,
  useUpdateRecord,
} from "@/app/shared/api/dataset.query";
import { useToast } from "@/app/shared/components/Toast";
import { DatasetDto, DynamicRecordDto } from "@/app/shared/types/dataset/types";
import { OrganizationDto } from "@/app/shared/types/auth/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const IMAGE_KEYS = new Set([
  "photo", "photo_url", "photo_path", "photo_key",
  "image", "image_url", "image_path", "image_key",
  "avatar", "avatar_url", "avatar_path",
  "barcode", "barcode_url", "barcode_path",
  "qr", "qr_code", "qr_code_url", "qr_code_path",
  "logo", "logo_url", "logo_path",
]);

function normalizeKey(v: string) {
  return v.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}
function isImageField(h: string) {
  return IMAGE_KEYS.has(normalizeKey(h));
}
function isImageUrl(v: string) {
  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("data:image/");
}

export default function AdminDatasetsScreen() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);

  const [showOrgPicker, setShowOrgPicker] = useState(false);
  const [showDatasetPicker, setShowDatasetPicker] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<DynamicRecordDto | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const isRefreshing = useRef(false);

  const toast = useToast();
  const pageSize = 20;

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
    // Auto-select first dataset when org changes or dataset list changes
    if (datasets.length > 0) {
      if (!selectedDatasetId || !datasets.find((d) => d.id === selectedDatasetId)) {
        setSelectedDatasetId(datasets[0].id);
      }
    } else {
      setSelectedDatasetId(null);
    }
  }, [datasets, selectedDatasetId]);

  const currentDataset = datasets.find((d) => d.id === selectedDatasetId) ?? null;

  const { data: recordsData, isLoading: recordsLoading, refetch } = useRecords(
    selectedDatasetId,
    { page, pageSize, search: search || undefined, orgId: selectedOrgId || undefined }
  );

  const records = recordsData?.items ?? [];
  const headers = recordsData?.headers ?? currentDataset?.headers ?? [];
  const total = recordsData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const { mutate: deleteRecord } = useDeleteRecord();

  const handleRefresh = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
      setTimeout(() => { isRefreshing.current = false; }, 1000);
    }
  }, [refetch]);

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleDelete = useCallback(
    (recordId: string) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      deleteRecord(
        { recordId, orgId: selectedOrgId || undefined },
        {
          onSuccess: () => {
            toast.show({ type: "success", title: "Deleted", message: "Record removed" });
            setSelectedRecord(null);
            setExpandedId(null);
          },
          onError: () => {
            toast.show({ type: "error", title: "Error", message: "Failed to delete" });
          },
        }
      );
    },
    [deleteRecord, selectedOrgId, toast]
  );

  const selectOrg = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedOrgId(id);
    setSelectedDatasetId(null);
    setPage(1);
    setSearch("");
    setSearchInput("");
    setExpandedId(null);
    setShowOrgPicker(false);
  };

  const selectDataset = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDatasetId(id);
    setPage(1);
    setSearch("");
    setSearchInput("");
    setExpandedId(null);
    setShowDatasetPicker(false);
  };

  const previewHeaders = useMemo(() => {
    return headers.filter((h) => !isImageField(h)).slice(0, 3);
  }, [headers]);

  const photoHeader = useMemo(() => {
    return headers.find((h) => isImageField(h)) ?? null;
  }, [headers]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-black">Admin Datasets</Text>
      </View>

      {/* Selectors */}
      <View className="px-6 mb-3 flex-row space-x-2">
        {/* Org Selector */}
        <Pressable
          className="flex-1 bg-gray-50 rounded-2xl px-4 py-3.5 flex-row items-center mr-2 active:bg-gray-100 border border-gray-100"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowOrgPicker(true);
          }}
        >
          <View className="flex-1">
            <Text className="text-xs text-gray-400">Organization</Text>
            <Text className="text-black font-semibold text-sm" numberOfLines={1}>
              {currentOrg?.name ?? "All"}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
        </Pressable>

        {/* Dataset Selector */}
        <Pressable
          className="flex-1 bg-gray-50 rounded-2xl px-4 py-3.5 flex-row items-center border border-gray-100 active:bg-gray-100"
          onPress={() => {
            if (datasets.length > 0) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowDatasetPicker(true);
            }
          }}
        >
          <View className="flex-1">
            <Text className="text-xs text-gray-400">Dataset</Text>
            <Text className="text-black font-semibold text-sm" numberOfLines={1}>
              {currentDataset?.name ?? "Select"}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
        </Pressable>
      </View>

      {/* Search */}
      {selectedDatasetId && (
        <View className="px-6 mb-3 flex-row items-center">
          <View className="flex-1 flex-row items-center bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-sm text-black"
              placeholder="Search records..."
              placeholderTextColor="#9CA3AF"
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchInput.length > 0 && (
              <Pressable onPress={() => { setSearchInput(""); setSearch(""); setPage(1); }}>
                <Ionicons name="close-circle" size={18} color="#D1D5DB" />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Content */}
      {orgsLoading || (selectedOrgId && datasetsLoading) ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#EAB308" size="large" />
        </View>
      ) : datasets.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="document-text-outline" size={28} color="#9CA3AF" />
          </View>
          <Text className="text-gray-500 font-semibold text-base">No datasets for org</Text>
          <Text className="text-gray-400 text-sm mt-1 text-center">
            Change organization or import an Excel file
          </Text>
        </View>
      ) : recordsLoading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#EAB308" />
          <Text className="text-gray-400 text-sm mt-2">Loading records...</Text>
        </View>
      ) : records.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center mb-3">
            <Ionicons name="search-outline" size={24} color="#9CA3AF" />
          </View>
          <Text className="text-gray-500 font-medium">No records found</Text>
          {search && <Text className="text-gray-400 text-sm mt-1">Try a different search</Text>}
        </View>
      ) : (
        <>
          <FlatList
            data={records}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <RecordCard
                record={item}
                headers={headers}
                previewHeaders={previewHeaders}
                photoHeader={photoHeader}
                isExpanded={expandedId === item.id}
                onCardPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setSelectedRecord(item);
                }}
                onExpandToggle={() => {
                  Haptics.selectionAsync();
                  setExpandedId(expandedId === item.id ? null : item.id);
                }}
                onDelete={() => handleDelete(item.id)}
              />
            )}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />

          {totalPages > 1 && (
            <View className="flex-row items-center justify-center px-6 py-3 bg-white border-t border-gray-100">
              <Pressable
                className={`px-4 py-2 rounded-xl ${page <= 1 ? "opacity-30" : "active:bg-gray-100"}`}
                disabled={page <= 1}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPage((p) => p - 1); }}
              >
                <Ionicons name="chevron-back" size={20} color="#000" />
              </Pressable>
              <Text className="text-sm text-gray-500 mx-4">
                <Text className="font-semibold text-black">{page}</Text> / {totalPages}
              </Text>
              <Pressable
                className={`px-4 py-2 rounded-xl ${page >= totalPages ? "opacity-30" : "active:bg-gray-100"}`}
                disabled={page >= totalPages}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPage((p) => p + 1); }}
              >
                <Ionicons name="chevron-forward" size={20} color="#000" />
              </Pressable>
            </View>
          )}
        </>
      )}

      {/* Org Picker Modal */}
      <OrgPickerModal
        visible={showOrgPicker}
        onClose={() => setShowOrgPicker(false)}
        orgs={orgs}
        selectedId={selectedOrgId}
        onSelect={selectOrg}
      />

      {/* Dataset Picker Modal */}
      <DatasetPickerModal
        visible={showDatasetPicker}
        onClose={() => setShowDatasetPicker(false)}
        datasets={datasets}
        selectedId={selectedDatasetId}
        onSelect={selectDataset}
      />

      {/* Record Profile + Edit Modal */}
      {selectedRecord && (
        <RecordProfileModal
          record={selectedRecord}
          headers={headers}
          orgId={selectedOrgId}
          onClose={() => setSelectedRecord(null)}
          onDelete={() => handleDelete(selectedRecord.id)}
          onUpdated={(updated) => {
            setSelectedRecord(updated);
            refetch();
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Record Card (expandable + tappable) ────────────────────

function RecordCard({
  record,
  headers,
  previewHeaders,
  photoHeader,
  isExpanded,
  onCardPress,
  onExpandToggle,
  onDelete,
}: {
  record: DynamicRecordDto;
  headers: string[];
  previewHeaders: string[];
  photoHeader: string | null;
  isExpanded: boolean;
  onCardPress: () => void;
  onExpandToggle: () => void;
  onDelete: () => void;
}) {
  const photoValue = photoHeader ? String(record.data[photoHeader] ?? "").trim() : "";
  const photoUrl = record.photoUrl ?? (photoValue && isImageUrl(photoValue) ? photoValue : null);

  return (
    <View
      className={`rounded-2xl border overflow-hidden ${
        isExpanded ? "border-yellow-300 bg-white" : "border-gray-100 bg-gray-50"
      }`}
    >
      {/* Main Row — tap to open profile */}
      <Pressable
        className="px-4 py-3.5 flex-row items-center active:bg-gray-100"
        onPress={onCardPress}
      >
        <View className="w-11 h-11 rounded-xl bg-gray-200 items-center justify-center overflow-hidden">
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} className="w-11 h-11" resizeMode="cover" />
          ) : (
            <Text className="text-gray-400 font-bold text-sm">
              {String(record.data[previewHeaders[0]] ?? "?").charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View className="flex-1 ml-3">
          {previewHeaders.map((h, i) => {
            const val = String(record.data[h] ?? "").trim();
            return (
              <Text
                key={h}
                numberOfLines={1}
                className={i === 0 ? "text-black font-semibold text-sm" : "text-gray-400 text-xs mt-0.5"}
              >
                {val || "—"}
              </Text>
            );
          })}
        </View>

        <View className="bg-gray-200 rounded-lg px-2 py-0.5 mr-2">
          <Text className="text-gray-500 text-xs font-medium">#{record.rowIndex + 1}</Text>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onExpandToggle();
          }}
          className="w-8 h-8 rounded-lg bg-gray-100 items-center justify-center active:bg-gray-200"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#6B7280"
          />
        </Pressable>
      </Pressable>

      {/* Expanded Section — inline details */}
      {isExpanded && (
        <View className="border-t border-gray-100">
          <View className="px-4 py-3">
            {headers.map((header, idx) => {
              const value = String(record.data[header] ?? "").trim();
              const isImage = isImageField(header);
              const imgUrl =
                isImage && record.photoKey === value
                  ? record.photoUrl
                  : isImage && isImageUrl(value)
                    ? value
                    : null;

              return (
                <View key={header} style={idx > 0 ? { marginTop: 10 } : undefined}>
                  <Text className="text-xs text-gray-400 font-medium">{header}</Text>
                  {imgUrl ? (
                    <View className="flex-row items-center mt-1">
                      <Image
                        source={{ uri: imgUrl }}
                        className="w-10 h-10 rounded-lg"
                        resizeMode="cover"
                      />
                      <Text className="text-gray-500 text-xs ml-2 flex-1" numberOfLines={1}>
                        {value}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-black text-sm mt-0.5" selectable>
                      {value || "—"}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Quick Actions */}
          <View className="flex-row border-t border-gray-100">
            <Pressable
              className="flex-1 flex-row items-center justify-center py-3 active:bg-yellow-50"
              onPress={onCardPress}
            >
              <Ionicons name="open-outline" size={15} color="#EAB308" />
              <Text className="text-yellow-600 text-xs font-semibold ml-1.5">Open Profile</Text>
            </Pressable>
            <View className="w-px bg-gray-100" />
            <Pressable
              className="flex-1 flex-row items-center justify-center py-3 active:bg-red-50"
              onPress={onDelete}
            >
              <Ionicons name="trash-outline" size={15} color="#EF4444" />
              <Text className="text-red-500 text-xs font-semibold ml-1.5">Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Record Profile Modal (Full Screen) ─────────────────────

function RecordProfileModal({
  record,
  headers,
  orgId,
  onClose,
  onDelete,
  onUpdated,
}: {
  record: DynamicRecordDto;
  headers: string[];
  orgId: string | null;
  onClose: () => void;
  onDelete: () => void;
  onUpdated: (updated: DynamicRecordDto) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const toast = useToast();
  const { mutate: updateRecord, isPending: saving } = useUpdateRecord();

  useEffect(() => {
    if (editing) {
      const initial: Record<string, string> = {};
      for (const h of headers) {
        initial[h] = String(record.data[h] ?? "");
      }
      setForm(initial);
    }
  }, [editing, headers, record]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    updateRecord(
      { recordId: record.id, data: form, orgId: orgId || undefined },
      {
        onSuccess: (res) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.show({ type: "success", title: "Saved", message: "Record updated" });
          setEditing(false);
          onUpdated(res.data);
        },
        onError: (err: any) => {
          toast.show({
            type: "error",
            title: "Error",
            message: err?.response?.data?.message || "Failed to save",
          });
        },
      }
    );
  };

  const photoHeader = headers.find((h) => isImageField(h)) ?? null;
  const photoValue = photoHeader ? String(record.data[photoHeader] ?? "").trim() : "";
  const photoUrl = record.photoUrl ?? (photoValue && isImageUrl(photoValue) ? photoValue : null);

  const nameHeader = headers.find((h) => !isImageField(h));
  const displayName = nameHeader ? String(record.data[nameHeader] ?? "").trim() : `Row #${record.rowIndex + 1}`;
  const subHeader = headers.filter((h) => !isImageField(h))[1];
  const subValue = subHeader ? String(record.data[subHeader] ?? "").trim() : "";

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
                if (editing) { setEditing(false); } else { onClose(); }
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#000" />
            </Pressable>
            <Text className="text-lg font-bold text-black">
              {editing ? "Edit Record" : "Record Details"}
            </Text>
            {!editing ? (
              <Pressable
                className="w-10 h-10 bg-yellow-50 rounded-full items-center justify-center"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setEditing(true);
                }}
              >
                <Ionicons name="create-outline" size={20} color="#EAB308" />
              </Pressable>
            ) : (
              <View className="w-10" />
            )}
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="items-center pt-4 pb-6">
              <View
                className="w-24 h-24 rounded-full bg-yellow-400 items-center justify-center overflow-hidden"
              >
                {photoUrl ? (
                  <Image source={{ uri: photoUrl }} className="w-24 h-24" resizeMode="cover" />
                ) : (
                  <Text className="text-black text-3xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <Text className="text-xl font-bold text-black mt-4">{displayName || "—"}</Text>
              <View className="bg-gray-200 rounded-full px-3 py-0.5 mt-2">
                <Text className="text-gray-500 text-xs font-medium">Row #{record.rowIndex + 1}</Text>
              </View>
            </View>

            <View className="h-px bg-gray-100 mx-6" />

            {/* Fields */}
            <View className="px-6 pt-4 pb-6">
              {headers.map((header, index) => {
                const value = String(record.data[header] ?? "").trim();
                const isImage = isImageField(header);
                const imgUrl =
                  isImage && record.photoKey === value
                    ? record.photoUrl
                    : isImage && isImageUrl(value)
                      ? value
                      : null;

                if (editing) {
                  return (
                    <View key={header} style={index > 0 ? { marginTop: 16 } : undefined}>
                      <Text className="text-xs text-gray-400 font-medium mb-2 ml-1">
                        {header}
                      </Text>
                      <TextInput
                        className="border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black"
                        value={form[header] ?? ""}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, [header]: text }))}
                        placeholder={`Enter ${header}`}
                        placeholderTextColor="#D1D5DB"
                        multiline={value.length > 50}
                      />
                    </View>
                  );
                }

                return (
                  <View key={header} style={index > 0 ? { marginTop: 12 } : undefined}>
                    <View className="border border-gray-200 rounded-2xl px-4 py-3.5">
                      <Text className="text-xs text-gray-400 mb-0.5">{header}</Text>
                      {imgUrl ? (
                        <View className="flex-row items-center mt-1">
                          <Image
                            source={{ uri: imgUrl }}
                            className="w-14 h-14 rounded-xl"
                            resizeMode="cover"
                          />
                          <Text className="text-gray-500 text-xs ml-3 flex-1" numberOfLines={2}>
                            {value}
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-black text-sm font-medium" selectable>
                          {value || "—"}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Actions */}
            {editing ? (
              <View className="px-6 pb-8">
                <Pressable
                  className={`rounded-2xl py-4 items-center ${saving ? "bg-gray-800" : "bg-black"}`}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#EAB308" />
                  ) : (
                    <Text className="text-yellow-400 font-bold text-base">Save Changes</Text>
                  )}
                </Pressable>
                <Pressable
                  className="rounded-2xl py-3 items-center mt-2 active:bg-gray-100"
                  onPress={() => setEditing(false)}
                  disabled={saving}
                >
                  <Text className="text-gray-500 font-medium text-sm">Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <View className="px-6 pb-8">
                <Pressable
                  className="bg-black rounded-2xl py-4 items-center flex-row justify-center"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setEditing(true);
                  }}
                >
                  <Ionicons name="create-outline" size={18} color="#EAB308" />
                  <Text className="text-yellow-400 font-bold text-base ml-2">Edit Record</Text>
                </Pressable>

                <Pressable
                  className="bg-red-50 rounded-2xl py-4 items-center flex-row justify-center mt-3 active:bg-red-100"
                  onPress={onDelete}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text className="text-red-500 font-semibold text-base ml-2">Delete Record</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
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
            {datasets.map((ds, index) => {
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
            {orgs.map((org, index) => {
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
