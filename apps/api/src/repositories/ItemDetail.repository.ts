import { Types } from "mongoose";
import { ItemDetail, IItemDetail } from "../models/ItemDetail";

export interface CreateItemDetailData {
  _id?: Types.ObjectId;
  name: string;
  vendor: string;
  origin: string;
  unitPrice: number;
  vatRate?: number;
  quantity: number;
  description: string;
  developmentType: "Cloud" | "OnPremise";
  fileId: Types.ObjectId | null;
  note: string | null;
}

export class ItemDetailRepository {
  /**
   * Tạo mới một ItemDetail.
   * @param data - Dữ liệu cần thiết để tạo ItemDetail.
   * @returns ItemDetail vừa được tạo.
   */
  async create(data: CreateItemDetailData): Promise<IItemDetail> {
    const newItemDetail = new ItemDetail({
      developmentType: data.developmentType, //Loại môi trường áp dụng
      name: data.name, //Tên sản phẩm
      vendor: data.vendor, //Nhà sản xuất
      origin: data.origin, //Xuất xứ
      unitPrice: data.unitPrice, //Giá bán lẻ
      vatRate: data.vatRate, //Thuế suất
      description: data.description,
      quantity: data.quantity, //Số lượng mua;
      fileId: data.fileId || null,
      note: data.note || null,
    });
    return await newItemDetail.save();
  }

  /**
   * Lấy tất cả các ItemDetail từ cơ sở dữ liệu.
   * @returns Danh sách tất cả các ItemDetail.
   */
  async findAll(): Promise<IItemDetail[]> {
    return await ItemDetail.find();
  }

  /**
   * Tìm một ItemDetail theo ID.
   * @param id - ID của ItemDetail cần tìm.
   * @returns ItemDetail nếu tìm thấy, hoặc null nếu không tồn tại.
   * @throws Lỗi nếu ID không hợp lệ.
   */
  async findById(id: string): Promise<IItemDetail | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId");
    }
    return await ItemDetail.findById(id);
  }

  /**
   * Cập nhật một ItemDetail theo ID.
   * @param id - ID của ItemDetail cần cập nhật.
   * @param updateData - Dữ liệu cần cập nhật.
   * @returns ItemDetail sau khi cập nhật, hoặc null nếu không tồn tại.
   * @throws Lỗi nếu ID không hợp lệ.
   */
  async update(
    id: string,
    updateData: Partial<IItemDetail>
  ): Promise<IItemDetail | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId");
    }
    return await ItemDetail.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Xóa một ItemDetail theo ID.
   * @param id - ID của ItemDetail cần xóa.
   * @returns `true` nếu xóa thành công, `false` nếu không tìm thấy.
   * @throws Lỗi nếu ID không hợp lệ.
   */
  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId");
    }
    const result = await ItemDetail.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Tìm các ItemDetail theo loại môi trường phát triển (Cloud hoặc OnPremise).
   * @param developmentType - Loại môi trường phát triển.
   * @returns Danh sách các ItemDetail phù hợp.
   */
  async findByDevelopmentType(
    developmentType: "Cloud" | "OnPremise"
  ): Promise<IItemDetail[]> {
    return await ItemDetail.find({ developmentType });
  }

  /**
   * Tìm các ItemDetail theo tên (tìm kiếm không phân biệt chữ hoa/thường).
   * @param name - Tên cần tìm kiếm.
   * @returns Danh sách các ItemDetail phù hợp.
   */
  async searchByName(name: string): Promise<IItemDetail[]> {
    return await ItemDetail.find({
      name: { $regex: name, $options: "i" },
    });
  }
}
