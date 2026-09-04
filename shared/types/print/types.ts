export interface TemplateElement {
  id: string;
  type: string;
  value: string;
  x: number;
  y: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  showLabel?: boolean;
  label?: string;
  width?: number;
  height?: number;
}

export interface TemplateCanvas {
  width: number;
  height: number;
  backgroundImage?: string;
  elements: TemplateElement[];
}

export interface TemplateDto {
  id: string;
  orgId: string;
  datasetId: string;
  name: string;
  canvas: TemplateCanvas;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrintPayload {
  templateId: string;
  orgId: string;
  recordIds?: string[];
  page: number;
  pageSize: number;
}
