export type ImportJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface ImportJobDto {
  id: string;
  orgId: string;
  status: ImportJobStatus;
  filePath: string | null;
  imagesZipPath?: string | null;
  totalRows: number;
  processedRows: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface UploadImportResponse {
  success: true;
  data: {
    id: string;
    orgId: string;
    status: string;
    totalRows: number;
    processedRows: number;
    createdAt: string;
  };
}

export interface ListImportJobsResponse {
  success: true;
  data: ImportJobDto[];
}

export interface GetImportJobResponse {
  success: true;
  data: ImportJobDto;
}
