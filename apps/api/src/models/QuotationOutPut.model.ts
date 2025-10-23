import { model, Schema, Types } from "mongoose";
import { CostServerResponse, QuotationItemResponse, SelectedFeature } from "../types/quotation";
import { IDevice } from "./Device.model";

export interface OutPutQuotationData {
    _id?: Types.ObjectId;
    materialCosts: number | string; //chi phí vật tư phụ và nhân công thi công lắp đặt
    softwareInstallationCost: number; // Chi phí cài đặt phần mềm
    trainingCost: number;             // Chi phí đào tạo
    deploymentType: "Cloud" | "OnPremise";
    userCount: number | null;
    pointCount: number | null;
    cameraCount: number | null;
    iconKey: string;
    screenOptions?: IDevice[],
    switchOptions?: IDevice[],
    costServers: CostServerResponse[];
    devices: QuotationItemResponse[];
    licenses: QuotationItemResponse[];
    selectedFeatures?: SelectedFeature[];
    summary: {
        deviceTotal: number;
        licenseTotal: number;
        costServerTotal: number;
        costServerTotalNoVat: number;
        deploymentCost: number; //Chi phí triển khai tổng
        temporaryTotal: number;
        grandTotal: number;
        vatPrices: number;
    };
    quotationId: Types.ObjectId;
    // createdAt: Date;
}

const OutputQuotationSchema = new Schema<OutPutQuotationData>(
    {
        materialCosts: { type: Schema.Types.Mixed, required: true },
        softwareInstallationCost: { type: Number, required: true },
        trainingCost: { type: Number, required: true },
        deploymentType: { type: String, enum: ["Cloud", "OnPremise"], required: true },
        userCount: { type: Number, default: null },
        pointCount: { type: Number, default: null },
        cameraCount: { type: Number, default: null },
        iconKey: { type: String, required: true },

        screenOptions: { type: [Schema.Types.Mixed], default: [] },
        switchOptions: { type: [Schema.Types.Mixed], default: [] },
        costServers: { type: [Schema.Types.Mixed], default: [], required: true } as any,
        devices: { type: [Schema.Types.Mixed], default: [], required: true } as any,
        licenses: { type: [Schema.Types.Mixed], default: [], required: true } as any,
        selectedFeatures: { type: [Schema.Types.Mixed], default: [] } as any,

        summary: {
            deviceTotal: { type: Number, required: true },
            licenseTotal: { type: Number, required: true },
            costServerTotal: { type: Number, required: true },
            costServerTotalNoVat: { type: Number, required: true },
            deploymentCost: { type: Schema.Types.Mixed, required: true },
            temporaryTotal: { type: Number, required: true },
            grandTotal: { type: Schema.Types.Mixed, required: true },
            vatPrices: { type: Number, required: true },
        },
        quotationId: {
            type: Schema.Types.ObjectId,
            ref: "Quotation",
            required: true
        }
    },
    { timestamps: true }
);

export const OutputQuotationModel = model<OutPutQuotationData>(
    "OutputQuotation",
    OutputQuotationSchema
); 