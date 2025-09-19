import { Schema, Types, model } from "mongoose";

export type CloudUserLimit = {
  min: number;
  max: number;
};

// Interface cho admin (không có pointCount)
export interface AdminSelectedFeature {
  feature: string;
}

export interface ILicense {
  categoryId: Types.ObjectId;
  itemDetailId: Types.ObjectId;
  selectedFeatures?: AdminSelectedFeature[]; // Sử dụng AdminSelectedFeature
  userLimit?: number | CloudUserLimit;
  costServerId: Types.ObjectId;
  totalAmount: number;
}

const AdminSelectedFeatureSchema = new Schema<AdminSelectedFeature>(
  {
    feature: { type: String, required: true },
  },
  { _id: false }
);

const LicenseSchema = new Schema<ILicense>(
  {
    selectedFeatures: [AdminSelectedFeatureSchema], // Sử dụng schema mới
    userLimit: { type: Schema.Types.Mixed, required: false },
    costServerId: {
      type: Schema.Types.ObjectId,
      ref: "CostServer",
      required: true,
    },
    totalAmount: { type: Number, required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    itemDetailId: {
      type: Schema.Types.ObjectId,
      ref: "ItemDetail",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LicenseModel = model<ILicense>("License", LicenseSchema);
