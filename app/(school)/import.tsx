import { useImportJobs, useUploadImport } from "@/app/shared/api/import.query";
import { useToast } from "@/app/shared/components/Toast";
import { ImportJobDto, ImportJobStatus } from "@/app/shared/types/import/types";
import { getOrgId } from "@/app/lib/orgStore";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
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

export default function ImportScreen() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [excelFile, setExcelFile] = useState<PickedFile | null>(null);
  const [zipFile, setZipFile] = useState<PickedFile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [zipProgress, setZipProgress] = useState<number | null>(null);
  const [uploadStep, setUploadStep] = useState<string>("");

  const toast = useToast();
  const { mutate: upload, isPending: isUploading } = useUploadImport();
  const { data: jobs, isLoading: jobsLoading, refetch } = useImportJobs(orgId);

  useEffect(() => {
    getOrgId().then(setOrgId);
  }, []);

  const onRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const pickExcel = async () => {
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
    if (!excelFile || !orgId) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    setUploadStep(zipFile ? "Uploading Excel..." : "Uploading...");
    setZipProgress(null);

    upload(
      {
        fileUri: excelFile.uri,
        fileName: excelFile.name,
        mimeType: excelFile.mimeType,
        orgId,
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
            message: "Your files are being processed",
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
          <Text className="text-2xl font-bold text-black">Import</Text>
          <Text className="text-gray-500 text-sm mt-1">
            Upload Excel & Images ZIP together
          </Text>
        </View>

        {/* ── Excel File Picker ── */}
        <View className="mx-6 mt-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
            Excel File (Required)
          </Text>
          {!excelFile ? (
            <Pressable
              className="border-2 border-dashed border-gray-300 rounded-2xl py-8 items-center active:border-yellow-400 active:bg-yellow-50"
              onPress={pickExcel}
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
        {excelFile && (
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
                  <JobCard job={job} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── File Card ──────────────────────────────────────────────

function FileCard({
  file, onRemove, iconColor, iconName,
}: {
  file: PickedFile;
  onRemove: () => void;
  iconColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View className="bg-gray-50 rounded-2xl p-4 flex-row items-center">
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
        className="w-8 h-8 bg-red-50 rounded-lg items-center justify-center"
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

// ─── Job Card ───────────────────────────────────────────────

function JobCard({ job }: { job: ImportJobDto }) {
  const config = STATUS_CONFIG[job.status];
  const progress =
    job.totalRows > 0 ? Math.round((job.processedRows / job.totalRows) * 100) : 0;

  return (
    <Pressable
      className="bg-gray-50 rounded-2xl p-4 active:bg-gray-100"
      onPress={() => Haptics.selectionAsync()}
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
              {job.id.slice(0, 8)}...
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">{timeAgo(job.createdAt)}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: config.bg }} className="rounded-full px-3 py-1">
          <Text style={{ color: config.color }} className="text-xs font-semibold">
            {config.label}
          </Text>
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
        <View className="mt-3 bg-red-50 rounded-lg px-3 py-2">
          <Text className="text-red-600 text-xs" numberOfLines={2}>
            {job.errorMessage}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
