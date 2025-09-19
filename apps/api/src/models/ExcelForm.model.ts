import { Schema, model } from "mongoose";

// Thông tin chung của báo giá
interface ExcelFormInfo {
  projectName: string; // Tên dự án
  customerName: string; // Khách hàng
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  quotationType: string; // Ví dụ: "C-CAM On-premis"
  companyName: string; // Công ty báo giá
  companyAddress: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  quotationDate: string; // Ngày báo giá
}

// Chi tiết từng dòng sản phẩm/dịch vụ
interface ExcelFormItem {
  stt: number; // Số thứ tự
  description: string; // Mô tả
  technicalSpecs?: string; // Thông số kỹ thuật
  quantity: number; // Số lượng
  unit: string; // Đơn vị tính
  supplier?: string; // Nhà cung cấp (NCC)
  brand?: string; // Hãng
  origin?: string; // Xuất xứ
  unitPrice: number; // Đơn giá trước VAT
  discount?: number; // Khuyến mại
  totalBeforeVAT: number; // Thành tiền trước VAT
  vat: number; // Thuế VAT
  totalAfterVAT: number; // Thành tiền sau VAT
  note?: string; // Ghi chú
  imageUrl?: string; // Ảnh minh họa
}

// Nhóm chi phí (License, Thiết bị, Triển khai, ...)
interface ExcelFormCategory {
  categoryName: string; // Tên nhóm (Chi phí License phần mềm / Thiết bị / ...)
  items: ExcelFormItem[]; // Danh sách các item trong nhóm
  subtotalBeforeVAT: number; // Tổng trước VAT
  subtotalVAT: number; // VAT
  subtotalAfterVAT: number; // Tổng sau VAT
}

// Thông tin tổng kết
interface ExcelFormSummary {
  totalBeforeVAT: number;
  vat: number;
  totalAfterVAT: number;
  note?: string; // Ghi chú tổng (VD: Chi phí ước tính, có thể chênh lệch ±10%)
}

// Form chính
export interface ExcelForm {
  info: ExcelFormInfo;
  categories: ExcelFormCategory[];
  summary: ExcelFormSummary;
}

// Info schema
const ExcelFormInfoSchema = new Schema<ExcelFormInfo>({
  projectName: { type: String, required: true }, // Tên dự án
  customerName: { type: String, required: true }, // Khách hàng
  customerAddress: { type: String }, // Địa chỉ khách hàng
  customerPhone: { type: String }, // SĐT khách hàng
  customerEmail: { type: String }, // Email khách hàng
  quotationType: { type: String, required: true }, // Loại báo giá
  companyName: {
    type: String,
    required: true,
    default: "TỔNG CÔNG TY CÔNG NGHỆ & GIẢI PHÁP CMC",
  }, // Công ty báo giá
  companyAddress: {
    type: String,
    required: true,
    default: "Tòa CMC Tower, số 11, Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
  }, // Địa chỉ công ty
  contactName: { type: String, required: true, default: "Đào Huy Đức" }, // Người liên hệ
  contactPhone: { type: String, required: true, default: "0347104609" }, // SĐT liên hệ
  contactEmail: { type: String, required: true, default: "dhduc4@cmc.com.vn" }, // Email liên hệ
  quotationDate: { type: String, required: true }, // Ngày báo giá
});

// Item schema
const ExcelFormItemSchema = new Schema<ExcelFormItem>({
  stt: { type: Number, required: true }, // Số thứ tự
  description: { type: String, required: true }, // Mô tả
  technicalSpecs: { type: String }, // Thông số kỹ thuật
  quantity: { type: Number, required: true }, // Số lượng
  unit: { type: String, required: true }, // Đơn vị tính
  supplier: { type: String }, // Nhà cung cấp
  brand: { type: String }, // Hãng
  origin: { type: String }, // Xuất xứ
  unitPrice: { type: Number, required: true }, // Đơn giá trước VAT
  discount: { type: Number, default: 0 }, // Khuyến mại
  totalBeforeVAT: { type: Number, required: true }, // Thành tiền trước VAT
  vat: { type: Number, required: true }, // Thuế VAT
  totalAfterVAT: { type: Number, required: true }, // Thành tiền sau VAT
  note: { type: String }, // Ghi chú
  imageUrl: { type: String }, // Ảnh minh họa
});

// Category schema
const ExcelFormCategorySchema = new Schema<ExcelFormCategory>({
  categoryName: { type: String, required: true }, // Tên nhóm chi phí
  items: { type: [ExcelFormItemSchema], default: [] }, // Danh sách các item
  subtotalBeforeVAT: { type: Number, required: true }, // Tổng trước VAT
  subtotalVAT: { type: Number, required: true }, // VAT
  subtotalAfterVAT: { type: Number, required: true }, // Tổng sau VAT
});

// Summary schema
const ExcelFormSummarySchema = new Schema<ExcelFormSummary>({
  totalBeforeVAT: { type: Number, required: true }, // Tổng trước VAT
  vat: { type: Number, required: true }, // Tổng VAT
  totalAfterVAT: { type: Number, required: true }, // Tổng sau VAT
  note: { type: String }, // Ghi chú tổng kết
});

// Schema chính
const ExcelFormSchema = new Schema<ExcelForm>({
  info: ExcelFormInfoSchema,
  categories: [ExcelFormCategorySchema],
  summary: ExcelFormSummarySchema,
});

export const ExcelFormModel = model("ExcelForm", ExcelFormSchema);
