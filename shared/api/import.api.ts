import axiosInstance from "@/lib/axiosInstance";
import {
  GetImportJobResponse,
  ListImportJobsResponse,
  UploadImportResponse,
} from "../types/import/types";

// ─── Excel Upload ────────────────────────────────────────────

export const uploadImportApi = async (params: {
  fileUri: string;
  fileName: string;
  mimeType: string;
  orgId: string;
  deferProcessing?: boolean;
}): Promise<UploadImportResponse> => {
  const form = new FormData();

  form.append("excel", {
    uri: params.fileUri,
    name: params.fileName,
    type: params.mimeType,
  } as any);

  form.append("orgId", params.orgId);

  if (params.deferProcessing !== undefined) {
    form.append("deferProcessing", String(params.deferProcessing));
  }

  const res = await axiosInstance.post<UploadImportResponse>(
    "/import/upload",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
};

// ─── Multipart Images ZIP Upload ─────────────────────────────

type MultipartInitResponse = {
  jobId: string;
  key: string;
  uploadId: string;
  partSize: number;
};

type MultipartPart = { ETag: string; PartNumber: number };

export const initMultipartUpload = async (params: {
  jobId: string;
  fileName: string;
  contentType: string;
}) => {
  const res = await axiosInstance.post<{
    success: true;
    data: MultipartInitResponse;
  }>("/import/upload/images/multipart/init", params);
  return res.data;
};

export const getPartUrl = async (params: {
  jobId: string;
  key: string;
  uploadId: string;
  partNumber: number;
}) => {
  const res = await axiosInstance.post<{
    success: true;
    data: { url: string };
  }>("/import/upload/images/multipart/part-url", params);
  return res.data;
};

export const completeMultipartUpload = async (params: {
  jobId: string;
  key: string;
  uploadId: string;
  parts: MultipartPart[];
}) => {
  const res = await axiosInstance.post<{
    success: true;
    data: { jobId: string };
  }>("/import/upload/images/multipart/complete", params);
  return res.data;
};

export const abortMultipartUpload = async (params: {
  jobId: string;
  key: string;
  uploadId: string;
}) => {
  const res = await axiosInstance.post<{
    success: true;
    data: { jobId: string };
  }>("/import/upload/images/multipart/abort", params);
  return res.data;
};

import * as FileSystem from "expo-file-system/legacy";

/**
 * Upload a ZIP file using S3 multipart upload with progress tracking.
 * We use Expo FileSystem to natively stream the ENTIRE file as Part 1 
 * to avoid JS memory limits on large files (e.g. 200MB+ zips).
 */
export const uploadImagesZipMultipart = async (
  jobId: string,
  zipUri: string,
  zipName: string,
  zipMimeType: string,
  onProgress?: (percent: number) => void
) => {
  // 1. Init multipart upload
  const init = await initMultipartUpload({
    jobId,
    fileName: zipName,
    contentType: zipMimeType || "application/zip",
  });

  const { key, uploadId } = init.data;

  try {
    // 2. Get presigned URL for Part 1
    const partUrlRes = await getPartUrl({
      jobId,
      key,
      uploadId,
      partNumber: 1,
    });

    // 3. Upload the ENTIRE file as Part 1 using Native FileSystem
    const uploadTask = FileSystem.createUploadTask(
      partUrlRes.data.url,
      zipUri,
      {
        httpMethod: "PUT",
        headers: { "Content-Type": zipMimeType || "application/zip" },
        uploadType: 0 as any, // 0 = FileSystemUploadType.BINARY_CONTENT
      },
      (data) => {
        if (onProgress && data.totalBytesExpectedToSend > 0) {
          const percent = Math.round(
            (data.totalBytesSent / data.totalBytesExpectedToSend) * 100
          );
          onProgress(percent);
        }
      }
    );

    const response = await uploadTask.uploadAsync();

    if (!response || response.status < 200 || response.status >= 300) {
      throw new Error(`Upload failed with status ${response?.status}`);
    }

    // Extract ETag from response headers
    const etag =
      response.headers.ETag ||
      response.headers.etag ||
      response.headers.Etag;
      
    if (!etag) {
      throw new Error("Missing ETag from S3 response headers");
    }

    const parts = [{ ETag: etag, PartNumber: 1 }];

    // 4. Complete multipart upload
    await completeMultipartUpload({ jobId, key, uploadId, parts });
  } catch (err) {
    // Abort on failure
    await abortMultipartUpload({ jobId, key, uploadId }).catch(() => {});
    throw err;
  }
};

// ─── List / Get Jobs ─────────────────────────────────────────

export const listImportJobsApi = async (
  orgId: string
): Promise<ListImportJobsResponse> => {
  const res = await axiosInstance.get<ListImportJobsResponse>(
    `/import/jobs?orgId=${encodeURIComponent(orgId)}`
  );
  return res.data;
};

export const getImportJobApi = async (
  id: string
): Promise<GetImportJobResponse> => {
  const res = await axiosInstance.get<GetImportJobResponse>(
    `/import/jobs/${id}`
  );
  return res.data;
};

export const renameImportJobApi = async (
  id: string,
  name: string
): Promise<{ success: true; data: { id: string; name: string } }> => {
  const res = await axiosInstance.patch(`/import/jobs/${id}/rename`, { name });
  return res.data;
};

export const deleteImportJobApi = async (
  id: string
): Promise<{ success: true; data: { id: string } }> => {
  const res = await axiosInstance.delete(`/import/jobs/${id}`);
  return res.data;
};
