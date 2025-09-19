import { Types } from "mongoose";
import {
  LicenseModel,
  ILicense,
  CloudUserLimit,
  AdminSelectedFeature,
} from "../models/License.model";
import { IItemDetail, ItemDetail } from "../models/ItemDetail";
import { CostServerModel } from "../models/CostServer.model";

export interface CreateLicenseData {
  categoryId: Types.ObjectId;
  itemDetailId: Types.ObjectId;
  selectedFeatures?: AdminSelectedFeature[]; // Cập nhật type
  userLimit?: number | CloudUserLimit;
  costServerId: Types.ObjectId;
}

export class LicenseRepository {
  // Tạo mới license
  async create(data: CreateLicenseData): Promise<ILicense> {
    const itemDetails = await ItemDetail.find({ _id: data.itemDetailId });
    const costServers = await CostServerModel.find({ _id: data.costServerId });
    if (!itemDetails || itemDetails.length === 0) {
      throw new Error("ItemDetail not found");
    }

    const existing = await LicenseModel.findOne({
      userLimit: data.userLimit,
      categoryId: data.categoryId,
      itemDetailId: data.itemDetailId,
      selectedFeatures: data.selectedFeatures,
    });

    if (existing) {
      throw new Error("Dữ liệu đã được khởi tạo");
    }

    const itemDetail = itemDetails[0]; // Lấy phần tử đầu tiên
    const costServer = costServers[0];
    const totalAmount =
      itemDetail.unitPrice +
      costServer.unitPrice * (1 + itemDetail.vatRate / 100);

    const newLicense = new LicenseModel({
      categoryId: data.categoryId,
      itemDetailId: data.itemDetailId,
      selectedFeatures: data.selectedFeatures ?? [],
      userLimit: data.userLimit,
      costServerId: data.costServerId,
      totalAmount,
    });

    return await newLicense.save();
  }

  // Lấy tất cả licenses
  async findAll(): Promise<ILicense[]> {
    return await LicenseModel.find()
      .populate("categoryId")
      .populate("itemDetailId");
  }

  // Lấy license theo ID
  async findById(id: string): Promise<ILicense | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId");
    }
    return await LicenseModel.findById(id)
      .populate("categoryId")
      .populate("itemDetailId");
  }

  // Lấy licenses theo categoryId
  async findByCategoryId(categoryId: string): Promise<ILicense[]> {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new Error("Invalid CategoryId");
    }
    return await LicenseModel.find({ categoryId })
      .populate("categoryId")
      .populate("itemDetailId");
  }

  // Cập nhật license
  async update(
    id: string,
    updateData: Partial<ILicense>
  ): Promise<ILicense | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId");
    }

    const costServers = await CostServerModel.find({
      _id: updateData.costServerId,
    });

    const costServer = costServers[0];

    // Tính lại totalAmount nếu có thay đổi
    if (costServer.unitPrice !== undefined) {
      const existing = await this.findById(id);
      if (costServer && existing) {
        // Cần populate itemDetail để tính toán
        const itemDetail = existing.itemDetailId as any;
        if (itemDetail) {
          updateData.totalAmount =
            itemDetail.unitPrice +
            costServer.unitPrice * (1 + itemDetail.vatRate / 100);
        }
      }
    }

    return await LicenseModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("categoryId")
      .populate("itemDetailId");
  }

  // Xóa license
  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId");
    }
    const result = await LicenseModel.findByIdAndDelete(id);
    return !!result;
  }

  // Kiểm tra tồn tại
  async exists(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const count = await LicenseModel.countDocuments({ _id: id });
    return count > 0;
  }

  // Tìm theo khoảng giá
  async findByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<ILicense[]> {
    return await LicenseModel.find({
      totalAmount: { $gte: minPrice, $lte: maxPrice },
    })
      .populate("categoryId")
      .populate("itemDetailId");
  }

  // Tìm theo vendor
  async findByVendor(vendor: string): Promise<ILicense[]> {
    return await LicenseModel.find({
      vendor: { $regex: vendor, $options: "i" },
    }).populate("categoryId");
  }

  // Tìm theo user limit
  async findByUserLimit(
    minUsers: number,
    maxUsers?: number
  ): Promise<ILicense[]> {
    const query: any = { userLimit: { $gte: minUsers } };
    if (maxUsers) {
      query.userLimit.$lte = maxUsers;
    }
    return await LicenseModel.find(query)
      .populate("categoryId")
      .populate("itemDetailId");
  }

  // Tìm theo tên
  async searchByName(name: string): Promise<ILicense[]> {
    return await LicenseModel.find({
      name: { $regex: name, $options: "i" },
    }).populate("categoryId");
  }

  // Tính tổng giá trị
  async getTotalValue(categoryId: string): Promise<number> {
    const result = await LicenseModel.aggregate([
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

  // Đếm tổng số licenses
  async count(): Promise<number> {
    return await LicenseModel.countDocuments();
  }
}
