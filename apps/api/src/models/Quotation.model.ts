import { model, Schema, Types } from "mongoose";

export interface SelectedFeature {
  feature: string;
  pointCount: number;
}

export interface IQuotation {
  deploymentType: "Cloud" | "OnPremise";
  categoryId: Types.ObjectId;
  userCount: number | null;
  pointCount?: number;
  cameraCount?: number;
  selectedFeatures?: SelectedFeature[];
  iconKey?: string;
}

const SelectedFeatureSchema = new Schema<SelectedFeature>(
  {
    feature: { type: String, required: true },
    pointCount: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const QuotationSchema = new Schema<IQuotation>({
  deploymentType: {
    type: String,
    required: true,
    enum: ["Cloud", "OnPremise"],
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  userCount: { type: Number, required: false },
  pointCount: { type: Number, required: true },
  cameraCount: { type: Number, required: false },
  selectedFeatures: [SelectedFeatureSchema],
  iconKey: { type: String },
});

export const QuotationModel = model<IQuotation>("Quotation", QuotationSchema);
