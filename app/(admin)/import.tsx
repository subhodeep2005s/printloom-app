import { useImportJobs, useUploadImport, useRenameImportJob, useDeleteImportJob } from "@/app/shared/api/import.query";
import { useOrganizations } from "@/app/shared/api/auth.query";
import { AlertDialog } from "@/app/shared/components/AlertDialog";
import { useToast } from "@/app/shared/components/Toast";
import { ImportJobDto, ImportJobStatus } from "@/app/shared/types/import/types";
import { OrganizationDto } from "@/app/shared/types/auth/types";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PickedFile = {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
};

const STATUS_CONFIG: Record<
  ImportJobStatus,
  { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  pending: { label: "Pending", color: "#EAB308", bg: "#FFFBEB", icon: "time-outline" },
  processing: { label: "Processing", color: "#3B82F6", bg: "#EFF6FF", icon: "sync-outline" },
  completed: { label: "Completed", color: "#22C55E", bg: "#F0FDF4", icon: "checkmark-circle-outline" },
  failed: { label: "Failed", color: "#EF4444", bg: "#FEF2F2", icon: "alert-circle-outline" },
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(1)} ${units[i]}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AdminImportScreen() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [showOrgPicker, setShowOrgPicker] = useState(false);

  const [excelFile, setExcelFile] = useState<PickedFile | null>(null);
  const [zipFile, setZipFile] = useState<PickedFile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [zipProgress, setZipProgress] = useState<number | null>(null);
  const [uploadStep, setUploadStep] = useState<string>("");

  const toast = useToast();
  const { mutate: upload, isPending: isUploading } = useUploadImport();
  
  const { data: orgsData, isLoading: orgsLoading } = useOrganizations();
  const orgs = orgsData || [];

  useEffect(() => {
    if (!selectedOrgId && orgs.length > 0) {
      setSelectedOrgId(orgs[0].id);
    }
  }, [orgs, selectedOrgId]);

  const currentOrg = orgs.find((o) => o.id === selectedOrgId) ?? null;

  const { data: jobs, isLoading: jobsLoading, refetch } = useImportJobs(selectedOrgId);

  const onRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const pickExcel = async () => {
    if (!selectedOrgId) {
      toast.show({ type: "error", title: "Wait", message: "Please select an organization first." });
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const file = result.assets[0];
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setExcelFile({
        uri: file.uri,
        name: file.name,
        size: file.size || 0,
        mimeType:
          file.mimeType ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    } catch {
      toast.show({ type: "error", title: "Error", message: "Failed to pick file" });
    }
  };

  const pickZip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/zip", "application/x-zip-compressed", "*/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const file = result.assets[0];
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setZipFile({
        uri: file.uri,
        name: file.name,
        size: file.size || 0,
        mimeType: file.mimeType || "application/zip",
      });
    } catch {
      toast.show({ type: "error", title: "Error", message: "Failed to pick file" });
    }
  };

  const handleUpload = async () => {
    if (!excelFile || !selectedOrgId) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    setUploadStep(zipFile ? "Uploading Excel..." : "Uploading...");
    setZipProgress(null);

    upload(
      {
        fileUri: excelFile.uri,
        fileName: excelFile.name,
        mimeType: excelFile.mimeType,
        orgId: selectedOrgId,
        zipUri: zipFile?.uri,
        zipName: zipFile?.name,
        zipMimeType: zipFile?.mimeType,
        onZipProgress: (percent) => {
          setUploadStep("Uploading Images ZIP...");
          setZipProgress(percent);
        },
      },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.show({
            type: "success",
            title: "Upload Successful!",
            message: "Files are being processed",
          });
          setExcelFile(null);
          setZipFile(null);
          setZipProgress(null);
          setUploadStep("");
        },
        onError: (err: any) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          toast.show({
            type: "error",
            title: "Upload Failed",
            message: err?.response?.data?.message || err?.message || "Something went wrong",
          });
          setZipProgress(null);
          setUploadStep("");
        },
      }
    );
  };

  const clearFiles = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExcelFile(null);
    setZipFile(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EAB308" />
        }
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-2xl font-bold text-black">Admin Import</Text>
          <Text className="text-gray-500 text-sm mt-1">
            Upload Excel & Images ZIP together
          </Text>
        </View>

        {/* Org Selector */}
        <View className="mx-6 mt-2">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
            Target Organization
          </Text>
          <Pressable
            className="bg-gray-50 rounded-2xl px-4 py-4 flex-row items-center active:bg-gray-100 border border-gray-200"
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

        {/* ── Excel File Picker ── */}
        <View className="mx-6 mt-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
            Excel File (Required)
          </Text>
          {!excelFile ? (
            <Pressable
              className={`border-2 border-dashed border-gray-300 rounded-2xl py-8 items-center ${
                selectedOrgId ? "active:border-yellow-400 active:bg-yellow-50" : "opacity-50"
              }`}
              onPress={pickExcel}
              disabled={!selectedOrgId}
            >
              <View className="w-14 h-14 bg-black rounded-2xl items-center justify-center mb-3">
                <Ionicons name="document-text" size={24} color="#EAB308" />
              </View>
              <Text className="text-black font-bold text-sm">Select Excel File</Text>
              <Text className="text-gray-400 text-xs mt-1">.xlsx or .xls</Text>
            </Pressable>
          ) : (
            <FileCard
              file={excelFile}
              onRemove={() => setExcelFile(null)}
              iconColor="#22C55E"
              iconName="document-text"
            />
          )}
        </View>

        {/* ── ZIP File Picker ── */}
        <View className="mx-6 mt-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
            Images ZIP (Optional)
          </Text>
          {!zipFile ? (
            <Pressable
              className="border-2 border-dashed border-gray-200 rounded-2xl py-8 items-center active:border-yellow-400 active:bg-yellow-50"
              onPress={pickZip}
            >
              <View className="w-14 h-14 bg-gray-100 rounded-2xl items-center justify-center mb-3">
                <Ionicons name="images" size={24} color="#9CA3AF" />
              </View>
              <Text className="text-gray-600 font-bold text-sm">Select Images ZIP</Text>
              <Text className="text-gray-400 text-xs mt-1">.zip containing images</Text>
            </Pressable>
          ) : (
            <FileCard
              file={zipFile}
              onRemove={() => setZipFile(null)}
              iconColor="#3B82F6"
              iconName="archive"
            />
          )}
        </View>

        {/* ── Upload Button ── */}
        {excelFile && selectedOrgId && (
          <View className="mx-6 mt-6">
            {/* Upload progress */}
            {isUploading && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-600 mb-2">
                  {uploadStep}
                </Text>
                {zipProgress !== null && (
                  <View className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${zipProgress}%` }}
                    />
                  </View>
                )}
              </View>
            )}

            <Pressable
              className={`rounded-2xl py-4 items-center flex-row justify-center ${
                isUploading ? "bg-gray-800" : "bg-black"
              }`}
              onPress={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <ActivityIndicator color="#EAB308" size="small" />
                  <Text className="text-yellow-400 font-bold text-base ml-2">
                    {uploadStep || "Uploading..."}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#EAB308" />
                  <Text className="text-yellow-400 font-bold text-base ml-2">
                    Upload & Import
                  </Text>
                </>
              )}
            </Pressable>

            {!isUploading && (
              <Pressable
                className="rounded-2xl py-3 items-center mt-2 active:bg-gray-100"
                onPress={clearFiles}
              >
                <Text className="text-gray-500 font-medium text-sm">Clear All</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* ── Import History ── */}
        <View className="mx-6 mt-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
              Import History
            </Text>
            {jobs && jobs.length > 0 && (
              <Text className="text-xs text-gray-400">
                {jobs.length} job{jobs.length !== 1 ? "s" : ""}
              </Text>
            )}
          </View>

          {jobsLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator color="#EAB308" />
            </View>
          ) : !jobs || jobs.length === 0 ? (
            <View className="bg-gray-50 rounded-2xl py-12 items-center mb-8">
              <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="folder-open-outline" size={24} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500 font-medium text-sm">No imports yet</Text>
              <Text className="text-gray-400 text-xs mt-1">Upload files to get started</Text>
            </View>
          ) : (
            <View className="pb-8">
              {jobs.map((job, index) => (
                <View key={job.id} style={index > 0 ? { marginTop: 12 } : undefined}>
                  <JobCard job={job} onRefresh={refetch} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Org Picker Modal */}
      <OrgPickerModal
        visible={showOrgPicker}
        onClose={() => setShowOrgPicker(false)}
        orgs={orgs}
        selectedId={selectedOrgId}
        onSelect={(id) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedOrgId(id);
          setShowOrgPicker(false);
          // Also clear existing so they don't upload to wrong org
          setExcelFile(null);
          setZipFile(null);
        }}
      />
    </SafeAreaView>
  );
}

// ─── Component Helpers ─────────────────────────────────────

function FileCard({
  file, onRemove, iconColor, iconName,
}: {
  file: PickedFile;
  onRemove: () => void;
  iconColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View className="bg-gray-50 rounded-2xl p-4 flex-row items-center border border-gray-100">
      <View
        className="w-11 h-11 rounded-xl items-center justify-center"
        style={{ backgroundColor: iconColor + "18" }}
      >
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-black font-semibold text-sm" numberOfLines={1}>
          {file.name}
        </Text>
        <Text className="text-gray-400 text-xs mt-0.5">
          {formatFileSize(file.size)}
        </Text>
      </View>
      <Pressable
        className="w-8 h-8 bg-red-50 rounded-lg items-center justify-center active:bg-red-100"
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onRemove();
        }}
      >
        <Ionicons name="close" size={18} color="#EF4444" />
      </Pressable>
    </View>
  );
}

function JobCard({ job, onRefresh }: { job: ImportJobDto; onRefresh: () => void }) {
  const config = STATUS_CONFIG[job.status];
  const progress =
    job.totalRows > 0 ? Math.round((job.processedRows / job.totalRows) * 100) : 0;

  const [showActions, setShowActions] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newName, setNewName] = useState(job.name ?? "");

  const toast = useToast();
  const { mutate: renameJob, isPending: isRenaming } = useRenameImportJob();
  const { mutate: deleteJob, isPending: isDeleting } = useDeleteImportJob();

  const displayName = job.name ?? `Import ${job.id.slice(0, 8)}`;

  const handleRename = () => {
    if (!newName.trim()) return;
    renameJob(
      { id: job.id, name: newName.trim() },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.show({ type: "success", title: "Renamed", message: "Import job renamed" });
          setShowRename(false);
          setShowActions(false);
          onRefresh();
        },
        onError: (err: any) => {
          toast.show({ type: "error", title: "Error", message: err?.response?.data?.message || "Failed to rename" });
        },
      }
    );
  };

  const handleDelete = () => {
    deleteJob(job.id, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.show({ type: "success", title: "Deleted", message: "Import job deleted" });
        setShowDeleteDialog(false);
        setShowActions(false);
        onRefresh();
      },
      onError: (err: any) => {
        toast.show({ type: "error", title: "Error", message: err?.response?.data?.message || "Failed to delete" });
      },
    });
  };

  return (
    <>
      <Pressable
        className="bg-gray-50 rounded-2xl p-4 active:bg-gray-100 border border-gray-100"
        onPress={() => Haptics.selectionAsync()}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowActions(true);
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View
              style={{ backgroundColor: config.bg }}
              className="w-10 h-10 rounded-xl items-center justify-center"
            >
              <Ionicons name={config.icon} size={20} color={config.color} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-black font-semibold text-sm" numberOfLines={1}>
                {displayName}
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5">{timeAgo(job.createdAt)}</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <View style={{ backgroundColor: config.bg }} className="rounded-full px-3 py-1">
              <Text style={{ color: config.color }} className="text-xs font-semibold">
                {config.label}
              </Text>
            </View>
            <Pressable
              className="w-8 h-8 items-center justify-center rounded-lg active:bg-gray-200"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowActions(true);
              }}
            >
              <Ionicons name="ellipsis-vertical" size={16} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {(job.status === "processing" || job.status === "completed") && job.totalRows > 0 && (
          <View className="mt-3">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-xs text-gray-400">
                {job.processedRows} / {job.totalRows} rows
              </Text>
              <Text className="text-xs font-semibold text-black">{progress}%</Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: job.status === "completed" ? "#22C55E" : "#EAB308",
                }}
              />
            </View>
          </View>
        )}

        {job.status === "failed" && job.errorMessage && (
          <View className="mt-3 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
            <Text className="text-red-600 text-xs font-medium" numberOfLines={2}>
              {job.errorMessage}
            </Text>
          </View>
        )}

        <Text className="text-gray-300 text-xs mt-2 ml-0.5">Long press for options</Text>
      </Pressable>

      {/* Actions bottom sheet */}
      <Modal visible={showActions} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setShowActions(false)}>
          <View className="bg-white rounded-t-3xl pb-8 px-6">
            <View className="items-center pt-3 pb-4">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>
            <Text className="text-base font-bold text-black mb-4" numberOfLines={1}>
              {displayName}
            </Text>

            <Pressable
              className="flex-row items-center py-4 border-b border-gray-100 active:bg-gray-50 rounded-xl px-2"
              onPress={() => {
                setNewName(job.name ?? `Import ${job.id.slice(0, 8)}`);
                setShowRename(true);
                setShowActions(false);
              }}
            >
              <Ionicons name="pencil-outline" size={20} color="#000" />
              <Text className="text-black font-medium text-base ml-3">Rename</Text>
            </Pressable>

            <Pressable
              className="flex-row items-center py-4 active:bg-red-50 rounded-xl px-2"
              onPress={() => {
                setShowActions(false);
                // slight delay so the bottom sheet closes before dialog opens
                setTimeout(() => setShowDeleteDialog(true), 300);
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text className="text-red-500 font-medium text-base ml-3">Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Rename modal */}
      <Modal visible={showRename} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center px-6">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-lg font-bold text-black mb-4">Rename Import</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-black text-base mb-4"
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter a name..."
              placeholderTextColor="#9CA3AF"
              autoFocus
              maxLength={100}
            />
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 py-3 rounded-xl bg-gray-100 items-center"
                onPress={() => setShowRename(false)}
              >
                <Text className="text-gray-600 font-medium">Cancel</Text>
              </Pressable>
              <Pressable
                className={`flex-1 py-3 rounded-xl items-center ${!newName.trim() || isRenaming ? "bg-gray-300" : "bg-black"}`}
                onPress={handleRename}
                disabled={!newName.trim() || isRenaming}
              >
                {isRenaming ? (
                  <ActivityIndicator color="#EAB308" size="small" />
                ) : (
                  <Text className="text-yellow-400 font-semibold">Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation — shadcn-style AlertDialog */}
      <AlertDialog
        visible={showDeleteDialog}
        title="Delete this import?"
        description={`"${displayName}" will be permanently removed. This action cannot be undone.`}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        confirmDestructive
        loading={isDeleting}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
      />
    </>
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
