// Common types for the pricing tool application

export interface ServiceOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
}

export interface SelectedFeature {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

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

export interface QuotationResponse {
  id: string;
  totalPrice: number;
  services: SelectedFeature[];
  createdAt: Date;
  validUntil: Date;
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

export interface CostServer {
  id: string;
  name: string;
  specifications: Record<string, any>;
  price: number;
}

export interface ItemDetail {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
}

export interface CreateAccount {
  name: string,
  email: string,
  password: string,
  role: "Admin" | "User"
}

export interface SignInResponse {
  // token: string;
  id: string;
  name: string;
  role: string;
}
