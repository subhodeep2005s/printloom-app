import axiosInstance from "@/app/lib/axiosInstance";
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
  const res = await axiosInstance.patch<SingleRecordResponse>(
    `/datasets/records/${recordId}`,
    { data },
    orgId ? { params: { orgId } } : undefined
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
