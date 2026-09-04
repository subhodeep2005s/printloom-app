import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "./dashboard.api";
import { DashboardStatsDto } from "../types/dashboard/types";

export const DASHBOARD_QUERY_KEYS = {
  stats: ["dashboard", "stats"] as const,
};

export const useDashboardStats = (orgId?: string | null) => {
  return useQuery<DashboardStatsDto, Error>({
    queryKey: [...DASHBOARD_QUERY_KEYS.stats, orgId],
    queryFn: () => fetchDashboardStats(orgId),
    enabled: orgId !== null, // Only fetch when orgId is known (or explicitly undefined if no orgStore is used)
  });
};
