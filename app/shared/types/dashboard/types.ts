export interface DashboardStatsDto {
  totalDatasets: number;
  totalRecords: number;
  totalImports: number;
  runningImports: number;
  totalOrganizations?: number;
  activeOrganizations?: number;
}

export interface DashboardStatsResponse {
  success: true;
  data: DashboardStatsDto;
}
