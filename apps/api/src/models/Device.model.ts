import { Schema, Types, model } from "mongoose";

// Interface cho admin (không có pointCount)
export interface AdminSelectedFeature {
  feature: string;
}

export interface IDevice {
  categoryId: Types.ObjectId;
  deviceType: string;
  itemDetailId: Types.ObjectId;
  selectedFeatures?: AdminSelectedFeature[]; // Sử dụng AdminSelectedFeature
  totalAmount: number;
}

const AdminSelectedFeatureSchema = new Schema<AdminSelectedFeature>(
  {
    feature: { type: String, required: true },
  },
  { _id: false }
);

const DeviceSchema = new Schema<IDevice>({
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  deviceType: {type: String, required: true},
  itemDetailId: {
    type: Schema.Types.ObjectId,
    ref: "ItemDetail",
    required: true,
  },
  selectedFeatures: [AdminSelectedFeatureSchema], // Sử dụng schema mới
  totalAmount: { type: Number, required: true },
});

export const DeviceModel = model<IDevice>("Device", DeviceSchema);
