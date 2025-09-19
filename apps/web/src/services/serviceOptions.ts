import api from "./api";
import { ServiceOption, ApiResponse } from "../types";

export const serviceOptionsApi = {
  getServiceOptions: async (): Promise<ServiceOption[]> => {
    try {
      const response = await api.get<ApiResponse<ServiceOption[]>>(
        "/categories"
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching service options:", error);
      return [];
    }
  },
};
