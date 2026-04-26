import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createRecordApi,
  deleteRecordApi,
  listDatasetsApi,
  listRecordsApi,
  updateRecordApi,
  uploadImageApi,
} from "./dataset.api";

export const useDatasets = (orgId: string | null) => {
  return useQuery({
    queryKey: ["datasets", orgId],
    queryFn: () =>
      listDatasetsApi({ orgId: orgId || undefined, page: 1, pageSize: 100 }),
    enabled: !!orgId,
    select: (data) => data.data,
    staleTime: 0,
    refetchOnMount: "always",
  });
};

export const useRecords = (
  datasetId: string | null,
  params: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    orgId?: string;
  }
) => {
  return useQuery({
    queryKey: ["records", datasetId, params],
    queryFn: () => listRecordsApi(datasetId!, params),
    enabled: !!datasetId,
    select: (data) => data.data,
  });
};

export const useCreateRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: {
      datasetId: string;
      data: Record<string, string>;
      orgId?: string;
    }) => createRecordApi(p.datasetId, p.data, p.orgId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["records"] }),
  });
};

export const useUpdateRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: {
      recordId: string;
      data: Record<string, string>;
      orgId?: string;
    }) => updateRecordApi(p.recordId, p.data, p.orgId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["records"] }),
  });
};

export const useDeleteRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { recordId: string; orgId?: string }) =>
      deleteRecordApi(p.recordId, p.orgId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["records"] }),
  });
};

/**
 * Upload image to /datasets/upload-image → returns S3 key/path.
 * The returned key should then be set in the record's image field
 * and saved via useUpdateRecord.
 */
export const useUploadImage = () => {
  return useMutation({
    mutationFn: (p: { photoUri: string; orgId?: string }) =>
      uploadImageApi(p.photoUri, p.orgId),
  });
};
