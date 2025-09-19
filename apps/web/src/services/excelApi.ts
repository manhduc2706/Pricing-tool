import { CreateQuotation } from "../types";
import api from "./api";

export const excelApi = async (data: CreateQuotation) => {
  try {
    const requestData = {
      ...data,
      selectedFeatures: data.selectedFeatures ?? null,
    };

    const response = await api.post("/quotations/createExcel", requestData, {
      responseType: "blob",
    });

    // Sử dụng File System Access API
    // Hiện tại chỉ hỗ trợ Chrome/Edge
    // Người dùng sẽ được chọn nơi lưu file
    const opts = {
      types: [
        {
          description: "Excel file",
          accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
              [".xlsx"],
          },
        },
      ],
    };

    // Mở dialog để người dùng chọn nơi lưu
    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: "Báo_giá.xlsx",
      ...opts,
    });

    const writable = await fileHandle.createWritable();
    await writable.write(response.data);
    await writable.close();
  } catch (error) {
    console.error("Error creating excel form:", error);
    throw error;
  }
};
