import { ShowQuotationProps } from "../types";
import api from "./api";

export const excelApi = async (_id: string) => {
  try {
    const requestData = {
      _id
    };

    const response = await api.post("/quotations/createExcel", requestData, {
      responseType: "blob", // Server trả file Excel dạng Blob
    });

    // Tạo URL cho Blob
    const url = window.URL.createObjectURL(new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }));

    // Tạo thẻ a để download
    const link = document.createElement("a");
    link.href = url;
    link.download = "Báo_giá.xlsx"; // Tên file khi tải về
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Giải phóng bộ nhớ
    window.URL.revokeObjectURL(url);

    console.log("File downloaded successfully: Báo_giá.xlsx");
  } catch (error) {
    console.error("Error creating excel form:", error);
    throw error;
  }
};
