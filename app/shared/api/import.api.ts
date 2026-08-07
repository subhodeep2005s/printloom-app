import axiosInstance from "@/app/lib/axiosInstance";
import * as SecureStore from "expo-secure-store";
import {
  GetImportJobResponse,
  ListImportJobsResponse,
  UploadImportResponse,
} from "../types/import/types";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

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

/**
 * Upload a ZIP file using S3 multipart upload with progress tracking.
 * Flow: init → get part URLs → upload parts to S3 → complete
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

  const { key, uploadId, partSize } = init.data;

  // 2. Fetch the ZIP file as a blob
  const fileResponse = await fetch(zipUri);
  const fileBlob = await fileResponse.blob();
  const total = fileBlob.size;
  const partCount = Math.ceil(total / partSize);

  const parts: MultipartPart[] = [];
  let uploadedBytes = 0;

  try {
    // 3. Upload each part sequentially (simpler for mobile)
    for (let partNumber = 1; partNumber <= partCount; partNumber++) {
      const start = (partNumber - 1) * partSize;
      const end = Math.min(start + partSize, total);
      const partBlob = fileBlob.slice(start, end);

      // Get presigned URL for this part
      const partUrlRes = await getPartUrl({
        jobId,
        key,
        uploadId,
        partNumber,
      });

      // Upload part to S3 with retries
      const etag = await uploadPartWithRetries(
        partUrlRes.data.url,
        partBlob,
        zipMimeType || "application/zip",
        3
      );

      parts.push({ ETag: etag, PartNumber: partNumber });
      uploadedBytes += partBlob.size;

      if (onProgress) {
        onProgress(Math.round((uploadedBytes / total) * 100));
      }
    }

    // 4. Complete multipart upload
    parts.sort((a, b) => a.PartNumber - b.PartNumber);
    await completeMultipartUpload({ jobId, key, uploadId, parts });
  } catch (err) {
    // Abort on failure
    await abortMultipartUpload({ jobId, key, uploadId }).catch(() => {});
    throw err;
  }
};

async function uploadPartWithRetries(
  url: string,
  body: Blob,
  contentType: string,
  maxRetries: number
): Promise<string> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxRetries) {
    attempt++;
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body,
      });
      if (!response.ok) {
        throw new Error(`Upload part failed (${response.status})`);
      }
      const etag =
        response.headers.get("etag") || response.headers.get("ETag");
      if (!etag) {
        throw new Error("Missing ETag from S3 response");
      }
      return etag;
    } catch (err) {
      lastError = err;
      if (attempt >= maxRetries) break;
      await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Part upload failed");
}

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
