// Common types for the web application

export interface ServiceOption {
  _id: string;
  name: string;
  iconKey: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateQuotation {
  deploymentType: "Cloud" | "OnPremise";
  _id: string;
  userCount: number | null;
  pointCount: number;
  cameraCount: number | null;
  siteCount: number | null;
  siteLocation: "TP Hà Nội" | "TP Hồ Chí Minh" | "Tỉnh khác" | null;
  selectedFeatures?: SelectedFeature[];
  iconKey?: string;
}

export interface SelectedFeature {
  feature: string;
  pointCount: number;
}

export interface ShowQuotationProps {
  quotation: {
    _id: string,
    iconKey: string;
    pointCount: number | null;
    cameraCount: number | null;
    deploymentType: "Cloud" | "OnPremise";
    materialCosts: number | string,
    softwareInstallationCost: number,
    trainingCost: number,
    screenOptions: IDevice[];
    switchOptions: IDevice[];
    devices: Array<{
      _id: string;
      name: string;
      itemType: string;
      vatRate: number;
      deviceType: string;
      selectedFeatures?: SelectedFeature[];
      quantity: number;
      pointCount: number;
      description: string;
      unitPrice: number;
      totalAmount: number;
      itemDetailId: string;
    }>;
    licenses: Array<{
      _id: string;
      name: string;
      itemType: string;
      vatRate: number;
      selectedFeatures?: SelectedFeature[];
      pointCount: number;
      quantity: number;
      description: string;
      unitPrice: number;
      costServer: number;
      totalAmount: number;
      itemDetailId: string;
    }>;
    costServers: Array<{
      _id: string;
      name: string;
      vatRate: number;
      selectedFeatures?: SelectedFeature[];
      quantity: number;
      description: string;
      unitPrice: number;
      totalAmount: number;
    }>;
    summary: {
      deviceTotal: number;
      licenseTotal: number;
      costServerTotal: number;
      costServerTotalNoVat: number;
      deploymentCost: number | string;
      grandTotal: number | string;
    };
  };
}

export interface IDevice {
  _id: string;
  categoryId: string;
  deviceType: string;
  itemDetailId: IItemDetail;
  selectedFeatures?: SelectedFeature[];
  totalAmount: number;
}

export interface IItemDetail {
  _id: string;
  developmentType: "Cloud" | "OnPremise"; //Loại môi trường áp dụng
  name: string; //Tên sản phẩm
  vendor: string; //Nhà sản xuất
  origin: string; //Xuất xứ
  unitPrice: number; //Giá bán lẻ
  vatRate: number; //Thuế suất
  description: string; //Thông số kỹ thuật
  note?: string; //Ghi chú
  quantity: number; //Số lượng mua
  fileId?: string;
}

// Additional shared types for frontend
export interface QuotationRequest {
  services: SelectedFeature[];
  userInfo: {
    name: string;
    email: string;
    company?: string;
  };
  location: string;
  infrastructure: string;
  cameraCount?: number;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface Device {
  _id: string;
  name: string;
  category: string;
  price: number;
  specifications?: Record<string, any>;
}

export interface License {
  _id: string;
  name: string;
  type: string;
  price: number;
  duration?: string;
}
