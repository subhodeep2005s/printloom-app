import axiosInstance from "../../lib/axiosInstance";
import { ApiResponse } from "../types/auth/types";
import { DashboardStatsDto } from "../types/dashboard/types";

export const fetchDashboardStats = async (): Promise<DashboardStatsDto> => {
  const { data } = await axiosInstance.get<ApiResponse<DashboardStatsDto>>("/dashboard/stats");
  return data.data;
};
