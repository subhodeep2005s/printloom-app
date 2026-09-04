import axiosInstance from "@/lib/axiosInstance";
import {
  DeleteRecordResponse,
  ListDatasetsResponse,
  ListRecordsResponse,
  SingleDatasetResponse,
  SingleRecordResponse,
} from "../types/dataset/types";

// ─── Datasets ────────────────────────────────────────────────

export const listDatasetsApi = async (params: {
  orgId?: string;
  page?: number;
  pageSize?: number;
}): Promise<ListDatasetsResponse> => {
  const query = new URLSearchParams();
  if (params.orgId) query.set("orgId", params.orgId);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  const res = await axiosInstance.get<ListDatasetsResponse>(
    `/datasets?${query.toString()}`
  );
  return res.data;
};

export const getDatasetApi = async (
  datasetId: string
): Promise<SingleDatasetResponse> => {
  const res = await axiosInstance.get<SingleDatasetResponse>(
    `/datasets/${datasetId}`
  );
  return res.data;
};

// ─── Records ─────────────────────────────────────────────────

export const listRecordsApi = async (
  datasetId: string,
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    orgId?: string;
  }
): Promise<ListRecordsResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.orgId) query.set("orgId", params.orgId);
  const res = await axiosInstance.get<ListRecordsResponse>(
    `/datasets/${datasetId}/records?${query.toString()}`
  );
  return res.data;
};

export const createRecordApi = async (
  datasetId: string,
  data: Record<string, string>,
  orgId?: string
): Promise<SingleRecordResponse> => {
  const res = await axiosInstance.post<SingleRecordResponse>(
    `/datasets/${datasetId}/records`,
    { data },
    orgId ? { params: { orgId } } : undefined
  );
  return res.data;
};

export const updateRecordApi = async (
  recordId: string,
  data: Record<string, string>,
  orgId?: string
): Promise<SingleRecordResponse> => {
  const body: { data: Record<string, string>; orgId?: string } = { data };
  if (orgId) body.orgId = orgId;
  const res = await axiosInstance.patch<SingleRecordResponse>(
    `/datasets/records/${recordId}`,
    body
  );
  return res.data;
};

export const deleteRecordApi = async (
  recordId: string,
  orgId?: string
): Promise<DeleteRecordResponse> => {
  const res = await axiosInstance.delete<DeleteRecordResponse>(
    `/datasets/records/${recordId}`,
    orgId ? { params: { orgId } } : undefined
  );
  return res.data;
};

// ─── Image Upload ────────────────────────────────────────────

export interface UploadImageResponse {
  success: true;
  data: {
    key: string; // e.g. "datasets/orgId/records/timestamp-filename.jpg"
  };
}

/**
 * Upload an image file to /datasets/upload-image.
 * Returns the S3 key/path which should be stored in the record's image field
 * via a subsequent PATCH /datasets/records/:id call.
 */
export const uploadImageApi = async (
  photoUri: string,
  orgId?: string
): Promise<UploadImageResponse> => {
  const formData = new FormData();

  // Get the filename and infer MIME type
  const filename = photoUri.split("/").pop() || "photo.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const mimeType =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  formData.append("image", {
    uri: photoUri,
    name: filename,
    type: mimeType,
  } as any);

  if (orgId) {
    formData.append("orgId", orgId);
  }

  const res = await axiosInstance.post<UploadImageResponse>(
    "/datasets/upload-image",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
};

