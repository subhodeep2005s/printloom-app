import axiosInstance from "@/lib/axiosInstance";
import { ApiResponse } from "../types/auth/types";
import { DashboardStatsDto } from "../types/dashboard/types";

export const fetchDashboardStats = async (orgId?: string | null): Promise<DashboardStatsDto> => {
  const url = orgId ? `/dashboard/stats?orgId=${orgId}` : "/dashboard/stats";
  const { data } = await axiosInstance.get<ApiResponse<DashboardStatsDto>>(url);
  return (
    data.data ?? {
      totalDatasets: 0,
      totalRecords: 0,
      totalImports: 0,
      runningImports: 0,
    }
  );
};
