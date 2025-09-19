import { CreateQuotation } from "../types";
import api from "./api";

export const quotationApi = async (data: CreateQuotation) => {
  try {
    const requestData = {
      ...data,
      selectedFeatures: data.selectedFeatures ?? null,
    };

    const response = await api.post("/quotations", requestData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating quotation:", error);
    throw error;
  }
};
