import { useQuery } from "@tanstack/react-query";
import { getDashboardStatsApi } from "./dashboard.api";

export const useDashboardStats = (params: {
  role?: "admin" | "org";
  orgId: string | null;
}) => {
  const scopedOrgId = params.role === "admin" ? undefined : params.orgId || undefined;

  return useQuery({
    queryKey: ["dashboardStats", params.role, scopedOrgId ?? "all"],
    queryFn: async () => {
      const res = await getDashboardStatsApi(scopedOrgId);
      return res.data;
    },
    enabled: params.role === "admin" || !!params.orgId,
    staleTime: 30_000,
  });
};
