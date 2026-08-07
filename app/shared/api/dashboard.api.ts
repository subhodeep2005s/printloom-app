import axiosInstance from "@/app/lib/axiosInstance";
import { DashboardStatsResponse } from "../types/dashboard/types";

export const getDashboardStatsApi = async (
  orgId?: string
): Promise<DashboardStatsResponse> => {
  const query = new URLSearchParams();
  if (orgId) query.set("orgId", orgId);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  const res = await axiosInstance.get<DashboardStatsResponse>(
    `/dashboard/stats${suffix}`
  );
  return res.data;
};
