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

  //Lọc device theo itemdetail
  async findDevicesByItemDetail(itemDetailId: string) {
    const device = await DeviceModel.find({
      itemDetailId: itemDetailId,
    })
      .populate("itemDetailId")
      .populate("categoryId");
    if (!device) throw new Error(`Không tìm thấy thiết bị với id: ${itemDetailId}`);
    return device;
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
      .populate("categoryId")
    if (!device) throw new Error(`Không tìm thấy thiết bị với id: ${id}`);
    return device;
  }

  //Tìm output quotation dựa trên quotationId
  async findOutPutQuotation(quotationId: string) {
    const outputQuotation = await OutputQuotationModel.findOne({
      quotationId: quotationId,
    })
      .populate("itemDetailId")
      .populate("categoryId")
    if (!outputQuotation) throw new Error(`Không tìm thấy quotation với id: ${quotationId}`)
    return outputQuotation;
  }

  async findDevices() {
    return await DeviceModel.find()
      .populate("itemDetailId")
      .populate("categoryId")
      .lean();
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
  async update(id: string, data: any) {
    await OutputQuotationModel.findByIdAndUpdate(id, { $set: data });
    const refreshedQuotation = await OutputQuotationModel.findById(id)
      .populate({
        path: "screenOptions",
        populate: [
          { path: "itemDetailId", model: "ItemDetail" },
          { path: "categoryId", model: "Category" },
        ]
      })
      .populate({
        path: "switchOptions",
        populate: [
          { path: "itemDetailId", model: "ItemDetail" },
          { path: "categoryId", model: "Category" },
        ]
      })
      .populate({
        path: "devices",
        populate: [
          { path: "itemDetailId", model: "ItemDetail" },
          { path: "categoryId", model: "Category" },
        ],
      })
      .populate({
        path: "licenses",
        populate: { path: "itemDetailId", model: "ItemDetail" },
      })
      .populate({
        path: "costServers",
        populate: { path: "itemDetailId", model: "ItemDetail" },
      })
      .populate("quotationId");

    return refreshedQuotation;
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
    return await OutputQuotationModel.findById(id)
  }
}
