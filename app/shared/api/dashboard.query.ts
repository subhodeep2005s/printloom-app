import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "./dashboard.api";
import { DashboardStatsDto } from "../types/dashboard/types";

export const DASHBOARD_QUERY_KEYS = {
  stats: ["dashboard", "stats"] as const,
};

export const useDashboardStats = () => {
  return useQuery<DashboardStatsDto, Error>({
    queryKey: DASHBOARD_QUERY_KEYS.stats,
    queryFn: fetchDashboardStats,
  });
};
