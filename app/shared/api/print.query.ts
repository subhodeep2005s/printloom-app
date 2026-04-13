import { useMutation, useQuery } from "@tanstack/react-query";
import { getTemplatesApi, printDatasetApi } from "./print.api";
import { PrintPayload } from "../types/print/types";

export const useTemplates = (orgId?: string, datasetId?: string) => {
  return useQuery({
    queryKey: ["templates", orgId, datasetId],
    queryFn: async () => {
      const res = await getTemplatesApi(orgId, datasetId);
      return res.data; // Might be undefined but we type it based on ApiResponse
    },
    enabled: !!orgId,
  });
};

export const usePrintDataset = () => {
  return useMutation({
    mutationFn: ({ datasetId, data }: { datasetId: string; data: PrintPayload }) =>
      printDatasetApi(datasetId, data),
  });
};
