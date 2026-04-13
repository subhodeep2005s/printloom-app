export interface DatasetDto {
  id: string;
  orgId: string;
  name: string;
  headers: string[];
  headerMap: Record<string, string>;
  requiredFields: string[];
  totalRecords: number;
  createdAt: string;
  updatedAt: string;
}

export interface DynamicRecordDto {
  id: string;
  datasetId: string;
  rowIndex: number;
  data: Record<string, string>;
  normalizedData: Record<string, string>;
  photoKey?: string | null;
  photoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListDatasetsResponse {
  success: true;
  data: {
    items: DatasetDto[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface ListRecordsResponse {
  success: true;
  data: {
    headers: string[];
    headerMap: Record<string, string>;
    requiredFields: string[];
    items: DynamicRecordDto[];
    total: number;
    page: number;
    pageSize: number;
    sortBy: string;
    sortOrder: string;
  };
}

export interface SingleRecordResponse {
  success: true;
  data: DynamicRecordDto;
}

export interface SingleDatasetResponse {
  success: true;
  data: DatasetDto;
}

export interface DeleteRecordResponse {
  success: true;
  data: { id: string };
}
