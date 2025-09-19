import { Types } from "mongoose";
import { CostServerModel, ICostServer } from "../models/CostServer.model";

export interface CreateCostServer {
  name: string;
  unitPrice: number;
  vatRate: number;
  description?: string;
  quantity?: number;
  fileId: Types.ObjectId;
  note: string | null;
}

export class CostServerRepository {
  // Lấy tất cả các CostServer
  async getAll(): Promise<ICostServer[]> {
    return await CostServerModel.find();
  }

  // Lấy một CostServer theo ID
  async getById(id: string): Promise<ICostServer | null> {
    return await CostServerModel.findById(id);
  }

  // Tạo mới một CostServer
  async create(data: CreateCostServer): Promise<ICostServer> {
    // Validate dữ liệu đầu vào
    if (!data.name || typeof data.name !== "string") {
      throw new Error("Tên của CostServer là bắt buộc và phải là chuỗi.");
    }

    if (
      data.unitPrice === undefined ||
      typeof data.unitPrice !== "number" ||
      data.unitPrice < 0
    ) {
      throw new Error(
        "Giá đơn vị (unitPrice) là bắt buộc và phải là số không âm."
      );
    }

    if (
      data.vatRate === undefined ||
      typeof data.vatRate !== "number" ||
      data.vatRate < 0 ||
      data.vatRate > 100
    ) {
      throw new Error("VAT phải là số trong khoảng từ 0 đến 100.");
    }

    // Check trùng name + unitPrice
    const existing = await CostServerModel.findOne({
      name: data.name,
      unitPrice: data.unitPrice,
    });

    if (existing) {
      throw new Error(
        `CostServer với tên "${data.name}" và giá "${data.unitPrice}" đã tồn tại.`
      );
    }

    // Tính tổng giá trị (totalAmount)
    const totalAmount = data.unitPrice * (1 + data.vatRate / 100);

    // Tạo mới CostServer
    const newServer = new CostServerModel({
      name: data.name,
      unitPrice: data.unitPrice,
      vatRate: data.vatRate,
      description: data.description,
      totalAmount,
      fileId: data.fileId,
      note: data.note || null,
    });

    return await newServer.save();
  }

  // Cập nhật một CostServer theo ID
  async update(
    id: string,
    data: Partial<ICostServer>
  ): Promise<ICostServer | null> {
    return await CostServerModel.findByIdAndUpdate(id, data, { new: true });
  }

  // Xóa một CostServer theo ID
  async delete(id: string): Promise<ICostServer | null> {
    return await CostServerModel.findByIdAndDelete(id);
  }
}
