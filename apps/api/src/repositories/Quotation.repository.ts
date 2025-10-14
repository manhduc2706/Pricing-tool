import { Types } from "mongoose";
import { IQuotation, QuotationModel } from "../models/Quotation.model";
import {
  AdminSelectedFeature,
  DeviceModel,
  IDevice,
} from "../models/Device.model";
import {
  CloudUserLimit,
  ILicense,
  LicenseModel,
} from "../models/License.model";
import { ItemDetail } from "../models/ItemDetail";
import { CostServerModel } from "../models/CostServer.model";
import {
  CostServerResponse,
  CreateQuotationData,
  OutPutQuotationData,
  QuotationItemResponse,
} from "../types/quotation";
import { OutputQuotationModel } from "../models/QuotationOutPut.model";

export class QuotationRepository {

  //Lọc sản phẩm theo deploymentType
  async findItemDetailsByDeploymentType(deploymentType: string) {
    return ItemDetail.find({ developmentType: deploymentType });
  }

  //Lọc device theo category và itemdetail
  async findDevicesByCategory(categoryId: string, itemDetailIds: string[]) {
    return DeviceModel.find({
      categoryId,
      itemDetailId: { $in: itemDetailIds },
    })
      .populate("itemDetailId")
      .populate("categoryId");
  }

  //Lọc license theo itemdetail và category
  async findLicensesByQuery(query: any) {
    return LicenseModel.find(query)
      .populate("itemDetailId")
      .populate("categoryId");
  }

  //Tìm 1 device cụ thể theo ID
  async findDeviceById(id: string) {
    const device = await DeviceModel.findById(id)
      .populate("itemDetailId")
      .populate("categoryId");
    if (!device) throw new Error(`Không tìm thấy thiết bị với id: ${id}`);
    return device;
  }

  //Tìm 1 license cụ thể theo ID
  async findLicenseById(id: string) {
    const license = await LicenseModel.findById(id)
      .populate("itemDetailId")
      .populate("categoryId");
    if (!license) throw new Error(`Không tìm thấy license với id: ${id}`);
    return license;
  }

  //Lọc server theo id trong license
  async findCostServersByIds(ids: string[]) {
    return CostServerModel.find({ _id: { $in: ids } });
  }

  async findCostServerById(id: string) {
    const server = await CostServerModel.findById(id);
    if (!server) throw new Error(`Không tìm thấy server với id: ${id}`);
    return server;
  }


  //Lưu báo giá
  async saveQuotation(quotationData: Partial<IQuotation>) {
    const quotation = new QuotationModel(quotationData);
    return await quotation.save();
  }

  //Cập nhập báo giá theo id
  async update(id: string | Types.ObjectId, data: any) {
    return QuotationModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true } // Trả về document đã cập nhật
    );
  }

  async findByCategoryId(categoryId: string) {
    return await QuotationModel.find({ categoryId });
  }

  //Tìm theo id của input quotation
  async findById(id: string) {
    return await QuotationModel.findById(id);
  }

  //Tìm theo id của output quotation
  async findByIdOutPut(id: string) {
    return await OutputQuotationModel.findById(id);
  }
}
