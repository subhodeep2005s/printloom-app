import axiosInstance from "@/app/lib/axiosInstance";
import { ApiResponse } from "../types/auth/types";
import { PrintPayload, TemplateDto } from "../types/print/types";

export const getTemplatesApi = async (orgId?: string, datasetId?: string) => {
  const params: any = {};
  if (orgId) params.orgId = orgId;
  if (datasetId) params.datasetId = datasetId;

  const res = await axiosInstance.get<ApiResponse<TemplateDto[]>>("/templates", {
    params,
  });
  return res.data;
};

export const printDatasetApi = async (datasetId: string, payload: PrintPayload) => {
  // Using responseType: 'blob' since it returns a ZIP archive
  const res = await axiosInstance.post(`/print/${datasetId}`, payload, {
    responseType: "blob",
  });
  return res.data; // This will actually be a Blob, so we handle it accordingly.
};
