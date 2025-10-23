import { excelApi } from "../services/excelApi";
import { ShowQuotationProps } from "../types";
import IconExcel from "./ui/iconExcel";

export const DownloadExcelButton = ({ _id }: { _id: string }) => {
  const handleDownloadExcel = async () => {
    try {
      await excelApi(_id); // Gọi API để tải xuống file Excel
      console.log("=== Data gửi export Excel ===", _id);
    } catch (error) {
      console.error("Failed to download Excel file:", _id);
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
