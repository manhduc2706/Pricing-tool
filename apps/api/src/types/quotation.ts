import { Types } from "mongoose";

// Interface cho quotation (có pointCount)
export interface SelectedFeature {
  feature: string;
  pointCount: number;
}

export interface CreateQuotationData {
  deploymentType: "Cloud" | "OnPremise";
  categoryId: Types.ObjectId;
  userCount?: number;
  pointCount?: number;
  cameraCount?: number;
  selectedFeatures?: SelectedFeature[]; // Cập nhật type
  iconKey: string;
}

export interface QuotationItemResponse {
  itemDetailId: Types.ObjectId;
  name: string;
  deviceType?: string; //Loại thiết bị
  selectedFeatures?: SelectedFeature[];
  pointCount?: number;
  vendor: string; //Nhà cung cấp
  origin: string; //Xuất xứ
  cameraCount?: number;
  unitPrice: number;
  quantity: number;
  vatRate: number;
  priceRate: number | null;
  totalAmount: number;
  category?: string;
  description: string;
  note: string; //Ghi chú
  fileId?: Types.ObjectId;
}

export interface CostServerResponse {
  name: string;
  unitPrice: number;
  quantity: number;
  pointCount?: number;
  vatRate: number;
  priceRate: number | null;
  totalAmount: number;
  description: string;
  note: string; //Ghi chú
  fileId?: Types.ObjectId;
}

export interface OutPutQuotationData {
  quotationId: Types.ObjectId;
  deploymentType: "Cloud" | "OnPremise";
  userCount: number | null;
  pointCount: number | null;
  cameraCount: number | null;
  iconKey: string;
  costServers: CostServerResponse[];
  devices: QuotationItemResponse[];
  licenses: QuotationItemResponse[];
  selectedFeatures?: SelectedFeature[];
  summary: {
    deviceTotal: number;
    licenseTotal: number;
    costServerTotal: number;
    deploymentCost: number;
    grandTotal: number;
  };
  // createdAt: Date;
}

export interface CreateFile {
  fileName: string;
  fileKey: string;
  bucket: string;
}
