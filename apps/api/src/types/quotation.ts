import { Types } from "mongoose";
import { IDevice } from "../models/Device.model";

// Interface cho quotation (có pointCount)
export interface SelectedFeature {
  feature: string;
  pointCount: number;
}

export interface CreateQuotationData {
  siteCount: number;
  siteLocation: "TP Hà Nội" | "TP Hồ Chí Minh" | "Tỉnh khác" | null;
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
  vendor: string;
  origin: string;
  unitPrice: number;
  vatRate: number;
  quantity: number;
  priceRate: number | null;
  totalAmount: number;
  category?: string;
  description?: string;
  note?: string;
  selectedFeatures?: any[];
  fileId?: Types.ObjectId | null;
  deviceType?: string;
  pointCount?: number;
  cameraCount?: number;
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
  fileId?: Types.ObjectId | null;
}

export interface OutPutQuotationData {
  materialCosts: number | string; //chi phí vật tư phụ và nhân công thi công lắp đặt
  softwareInstallationCost: number; // Chi phí cài đặt phần mềm
  trainingCost: number;             // Chi phí đào tạo
  deploymentType: "Cloud" | "OnPremise";
  userCount: number | null;
  pointCount: number | null;
  cameraCount: number | null;
  iconKey: string;
  screenOptions?: IDevice[],
  switchOptions?: IDevice[],
  costServers: CostServerResponse[];
  devices: QuotationItemResponse[];
  licenses: QuotationItemResponse[];
  selectedFeatures?: SelectedFeature[];
  summary: {
    deviceTotal: number;
    licenseTotal: number;
    costServerTotal: number;
    costServerTotalNoVat: number;
    deploymentCost: number; //Chi phí triển khai tổng
    temporaryTotal: number;
    grandTotal: number;
    vatPrices: number;
  };
  quotationId: Types.ObjectId;
  // createdAt: Date;
}

export interface CreateFile {
  fileName: string;
  fileKey: string;
  bucket: string;
}
