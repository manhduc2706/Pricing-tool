import { excelApi } from "../services/excelApi";
import { CreateQuotation } from "../types";
import IconExcel from "./ui/iconExcel";

export const DownloadExcelButton = ({
  quotationData,
}: {
  quotationData: CreateQuotation;
}) => {
  const handleDownloadExcel = async () => {
    try {
      await excelApi(quotationData); // Gọi API để tải xuống file Excel
      console.log("=== Data gửi export Excel ===", quotationData);
    } catch (error) {
      console.error("Failed to download Excel file:", error);
    }
  };

  return (
    <button
      onClick={handleDownloadExcel}
      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
    >
      <IconExcel />
      Xuất Excel
    </button>
  );
};
