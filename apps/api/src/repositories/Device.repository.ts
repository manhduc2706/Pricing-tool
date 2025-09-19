import { Types } from "mongoose";
import {
  DeviceModel,
  IDevice,
  AdminSelectedFeature,
} from "../models/Device.model";
import { ItemDetailRepository } from "./ItemDetail.repository";
import { IItemDetail, ItemDetail } from "../models/ItemDetail";

export interface CreateDeviceData {
  categoryId: Types.ObjectId;
  itemDetailId: Types.ObjectId;
  deviceType: string;
  selectedFeatures?: AdminSelectedFeature[]; // Cập nhật type
}

export class DeviceRepository {
  private itemDetailRepository: ItemDetailRepository;

  constructor() {
    this.itemDetailRepository = new ItemDetailRepository();
  }

  //Tạo mới thiết bị
  async create(data: CreateDeviceData): Promise<IDevice> {
    const itemDetails = await ItemDetail.find({ _id: data.itemDetailId });
    if (!itemDetails || itemDetails.length === 0) {
      throw new Error("ItemDetail not found");
    }

    const existing = await DeviceModel.findOne({
      categoryId: data.categoryId,
      itemDetailId: data.itemDetailId,
      selectedFeatures: data.selectedFeatures,
      deviceType: data.deviceType,
    });

    if (existing) {
      throw new Error("Dữ liệu đã được khởi tạo");
    }

    const itemDetail = itemDetails[0]; // Lấy phần tử đầu tiên
    const totalAmount = itemDetail.unitPrice * (1 + itemDetail.vatRate / 100);

    const newDevice = new DeviceModel({
      categoryId: data.categoryId,
      itemDetailId: data.itemDetailId,
      deviceType: data.deviceType,
      selectedFeatures: data.selectedFeatures ?? [],
      totalAmount,
    });

    return await newDevice.save();
  }

  //Tìm tất cả thiết bị
  async findAll(): Promise<IDevice[]> {
    return await DeviceModel.find()
      .populate("categoryId")
      .populate("itemDetailId");
  }

  //Tìm thiết bị dựa vào id
  async findById(id: string): Promise<IDevice | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId");
    }
    return await DeviceModel.findById(id)
      .populate("categoryId")
      .populate("itemDetailId");
  }

  // Lấy device theo categoryId
  async findByCategoryId(categoryId: string): Promise<IDevice[]> {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new Error("Invalid CategoryId");
    }
    return await DeviceModel.find({ categoryId })
      .populate("categoryId")
      .populate("itemDetailId");
  }

  //Cập nhật lại thiết bị
  async update(
    id: string,
    updateData: Partial<IDevice>
  ): Promise<IDevice | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId");
    }

    // Tính lại totalAmount nếu có thay đổi

    const existing = await this.findById(id);
    if (existing) {
      // Cần populate itemDetail để tính toán
      const itemDetail = existing.itemDetailId as any;
      if (itemDetail) {
        updateData.totalAmount =
          itemDetail.unitPrice * (1 + itemDetail.vatRate);
      }
    }

    return await DeviceModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("categoryId")
      .populate("itemDetailId");
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId");
    }

    const device = await DeviceModel.findById(id);
    if (!device) {
      return false;
    }

    // Xóa ItemDetail trước
    await this.itemDetailRepository.delete(device.itemDetailId.toString());

    // Xóa Device
    const result = await DeviceModel.findByIdAndDelete(id);
    return !!result;
  }

  async findByItemType(itemType: string): Promise<IDevice[]> {
    return await DeviceModel.find({ itemType }).populate("itemDetailId");
  }

  async searchByName(name: string): Promise<IDevice[]> {
    const itemDetails = await this.itemDetailRepository.searchByName(name);
    const itemDetailIds = itemDetails.map((item) => item._id);

    return await DeviceModel.find({
      itemDetailId: { $in: itemDetailIds },
    }).populate("itemDetailId");
  }

  // Tính tổng giá trị
  async getTotalValue(categoryId: string): Promise<number> {
    const result = await DeviceModel.aggregate([
      { $match: { categoryId: new Types.ObjectId(categoryId) } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: "$totalAmount" },
        },
      },
    ]);
    return result.length > 0 ? result[0].totalValue : 0;
  }

  async count(): Promise<number> {
    return await DeviceModel.countDocuments();
  }
}
