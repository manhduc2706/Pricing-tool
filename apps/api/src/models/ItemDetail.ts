import { model, Schema, Types } from "mongoose";

export interface IItemDetail {
  _id?: Types.ObjectId;
  developmentType: "Cloud" | "OnPremise"; //Loại môi trường áp dụng
  name: string; //Tên sản phẩm
  vendor: string; //Nhà sản xuất
  origin: string; //Xuất xứ
  unitPrice: number; //Giá bán lẻ
  vatRate: number; //Thuế suất
  description: string; //Thông số kỹ thuật
  note?: string; //Ghi chú
  quantity: number; //Số lượng mua
  fileId?: Types.ObjectId;
}

const ItemDetailSchema = new Schema<IItemDetail>(
  {
    name: { type: String, required: true },
    vendor: { type: String, required: true },
    origin: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    vatRate: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    description: { type: String, required: true },
    note: { type: String, required: false },
    developmentType: {
      type: String,
      required: true,
      enum: ["Cloud", "OnPremise"],
    },
    fileId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "File",
    },
  },
  {
    timestamps: true,
  }
);

export const ItemDetail = model<IItemDetail>("ItemDetail", ItemDetailSchema);
