import { FileModel, IFile } from "../models/File.model";
import { IItemDetail } from "../models/ItemDetail";
import {
  CreateItemDetailData,
  ItemDetailRepository,
} from "../repositories/ItemDetail.repository";
import { CreateFile } from "../types/quotation";

export class ItemDetailService {
  private itemDetailRepository: ItemDetailRepository;

  constructor(repository?: ItemDetailRepository) {
    this.itemDetailRepository = repository || new ItemDetailRepository();
  }

  /**
   * Tạo mới một ItemDetail.
   * @param data - Dữ liệu cần thiết để tạo ItemDetail.
   * @returns ItemDetail vừa được tạo.
   */
  async createItemDetail(data: CreateItemDetailData): Promise<IItemDetail> {
    // Validate dữ liệu trước khi tạo
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Tên item không được để trống");
    }

    if (data.unitPrice <= 0) {
      throw new Error("Đơn giá phải lớn hơn 0");
    }

    if (data.quantity <= 0) {
      throw new Error("Số lượng phải lớn hơn 0");
    }

    if (data.vatRate && (data.vatRate < 0 || data.vatRate > 100)) {
      throw new Error("Thuế suất phải từ 0 đến 100%");
    }

    // Chuẩn hóa dữ liệu
    const processedData: CreateItemDetailData = {
      ...data,
      name: data.name.trim(),
      vendor: data.vendor?.trim(),
      origin: data.origin?.trim(),
      description: data.description?.trim(),
      vatRate: data.vatRate || 10,
    };
    return await this.itemDetailRepository.create(data);
  }

  /**
   * Lấy tất cả các ItemDetail từ cơ sở dữ liệu.
   * @returns Danh sách tất cả các ItemDetail.
   */
  async getAllItemDetails(): Promise<IItemDetail[]> {
    return await this.itemDetailRepository.findAll();
  }

  /**
   * Tìm một ItemDetail theo ID.
   * @param id - ID của ItemDetail cần tìm.
   * @returns ItemDetail nếu tìm thấy, hoặc null nếu không tồn tại.
   */
  async getItemDetailById(id: string): Promise<IItemDetail | null> {
    if (!id) {
      throw new Error("ID không hợp lệ");
    }
    return await this.itemDetailRepository.findById(id);
  }

  /**
   * Cập nhật một ItemDetail theo ID.
   * @param id - ID của ItemDetail cần cập nhật.
   * @param updateData - Dữ liệu cần cập nhật.
   * @returns ItemDetail sau khi cập nhật, hoặc null nếu không tồn tại.
   */
  async updateItemDetail(
    id: string,
    updateData: Partial<IItemDetail>
  ): Promise<IItemDetail | null> {
    if (!id) {
      throw new Error("ID không hợp lệ");
    }
    return await this.itemDetailRepository.update(id, updateData);
  }

  /**
   * Xóa một ItemDetail theo ID.
   * @param id - ID của ItemDetail cần xóa.
   * @returns `true` nếu xóa thành công, `false` nếu không tìm thấy.
   */
  async deleteItemDetail(id: string): Promise<boolean> {
    if (!id) {
      throw new Error("ID không hợp lệ");
    }
    return await this.itemDetailRepository.delete(id);
  }

  /**
   * Tìm các ItemDetail theo loại môi trường phát triển (Cloud hoặc OnPremise).
   * @param developmentType - Loại môi trường phát triển.
   * @returns Danh sách các ItemDetail phù hợp.
   */
  async getItemDetailsByDevelopmentType(
    developmentType: "Cloud" | "OnPremise"
  ): Promise<IItemDetail[]> {
    if (!developmentType) {
      throw new Error("Loại môi trường không hợp lệ");
    }
    return await this.itemDetailRepository.findByDevelopmentType(
      developmentType
    );
  }

  /**
   * Tìm các ItemDetail theo tên (tìm kiếm không phân biệt chữ hoa/thường).
   * @param name - Tên cần tìm kiếm.
   * @returns Danh sách các ItemDetail phù hợp.
   */
  async searchItemDetailsByName(name: string): Promise<IItemDetail[]> {
    if (!name) {
      throw new Error("Tên tìm kiếm không hợp lệ");
    }
    return await this.itemDetailRepository.searchByName(name);
  }

}
