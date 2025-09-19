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
  selectedFeatures?: SelectedFeature[];
  iconKey?: string;
}

export interface SelectedFeature {
  feature: string;
  pointCount: number;
}

export interface ShowQuotationProps {
  quotation: {
    iconKey: string;
    pointCount: number | null;
    cameraCount: number | null;
    deploymentType: "Cloud" | "OnPremise";
    devices: Array<{
      name: string;
      itemType: string;
      vatRate: number;
      selectedFeatures?: SelectedFeature[];
      quantity: number;
      pointCount: number;
      description: string;
      unitPrice: number;
      totalAmount: number;
    }>;
    licenses: Array<{
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
    }>;
    costServers: Array<{
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
      deploymentCost: number;
      grandTotal: number;
    };
  };
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
  id: string;
  name: string;
  description?: string;
}

export interface Device {
  id: string;
  name: string;
  category: string;
  price: number;
  specifications?: Record<string, any>;
}

export interface License {
  id: string;
  name: string;
  type: string;
  price: number;
  duration?: string;
}
