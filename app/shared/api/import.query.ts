import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getImportJobApi,
  listImportJobsApi,
  uploadImagesZipMultipart,
  uploadImportApi,
} from "./import.api";

/**
 * Upload Excel + optionally images ZIP together.
 * Flow: upload excel (deferProcessing if zip) → upload zip multipart → done
 */
export const useUploadImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      fileUri: string;
      fileName: string;
      mimeType: string;
      orgId: string;
      zipUri?: string;
      zipName?: string;
      zipMimeType?: string;
      onZipProgress?: (percent: number) => void;
    }) => {
      const hasZip = !!(params.zipUri && params.zipName);

      // Step 1: Upload Excel (defer if ZIP is included)
      const result = await uploadImportApi({
        fileUri: params.fileUri,
        fileName: params.fileName,
        mimeType: params.mimeType,
        orgId: params.orgId,
        deferProcessing: hasZip,
      });

      // Step 2: Upload ZIP via multipart if provided
      if (hasZip && result.data?.id) {
        await uploadImagesZipMultipart(
          result.data.id,
          params.zipUri!,
          params.zipName!,
          params.zipMimeType || "application/zip",
          params.onZipProgress
        );
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["importJobs"] });
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });
};

export const useImportJobs = (orgId: string | null) => {
  return useQuery({
    queryKey: ["importJobs", orgId],
    queryFn: () => listImportJobsApi(orgId!),
    enabled: !!orgId,
    select: (data) => data.data,
    refetchInterval: (query) => {
      const jobs = query.state.data?.data;
      if (!jobs?.length) return false;
      const hasActiveJobs = jobs.some(
        (j) => j.status === "pending" || j.status === "processing"
      );
      return hasActiveJobs ? 3000 : false;
    },
  });
};

export const useImportJob = (id: string | null) => {
  return useQuery({
    queryKey: ["importJob", id],
    queryFn: () => getImportJobApi(id!),
    enabled: !!id,
    select: (data) => data.data,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status === "pending" || status === "processing") {
        return 3000;
      }
      return false;
    },
  });
};
