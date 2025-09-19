import {
  LicenseRepository,
  CreateLicenseData,
} from "../repositories/License.repository";
import { CloudUserLimit, ILicense } from "../models/License.model";
import { CategoryService } from "../services/Category.service";

export class LicenseService {
  private licenseRepository: LicenseRepository;
  private categoryService: CategoryService;

  constructor() {
    this.licenseRepository = new LicenseRepository();
    this.categoryService = new CategoryService();
  }

  /**
   * Tạo mới một license.
   * @param data - Dữ liệu cần thiết để tạo license.
   * @returns License vừa được tạo.
   */
  async createLicense(data: CreateLicenseData): Promise<ILicense> {
    // Validate dữ liệu đầu vào
    // if (!data.itemType || data.itemType.trim().length === 0) {
    //   throw new Error("Loại sản phẩm không được để trống");
    // }

    if (!data.categoryId || !data.itemDetailId || !data.costServerId) {
      throw new Error("Category ID và ItemDetail ID và CostServerId không được để trống");
    }

    return await this.licenseRepository.create(data);
  }

  /**
   * Lấy tất cả các license.
   * @returns Danh sách tất cả các license.
   */
  async getAllLicenses(): Promise<ILicense[]> {
    return await this.licenseRepository.findAll();
  }

  /**
   * Lấy license theo ID.
   * @param id - ID của license cần tìm.
   * @returns License nếu tìm thấy, hoặc null nếu không tồn tại.
   */
  async getLicenseById(id: string): Promise<ILicense | null> {
    return await this.licenseRepository.findById(id);
  }

  /**
   * Lấy license theo ID danh mục.
   * @param categoryId - ID của danh mục.
   * @returns Danh sách license thuộc danh mục.
   */
  async getLicensesByCategoryId(categoryId: string): Promise<ILicense[]> {
    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error("Category ID không được để trống");
    }
    return await this.licenseRepository.findByCategoryId(categoryId.trim());
  }

  /**
   * Cập nhật license theo ID.
   * @param id - ID của license cần cập nhật.
   * @param updateData - Dữ liệu cần cập nhật.
   * @returns License sau khi cập nhật, hoặc null nếu không tồn tại.
   */
  async updateLicense(
    id: string,
    updateData: Partial<ILicense>
  ): Promise<ILicense | null> {

    if (updateData.userLimit !== undefined) {
      if (typeof updateData.userLimit === "number") {
        // trường hợp OnPremise
        if (updateData.userLimit <= 0) {
          throw new Error("Giới hạn người dùng phải lớn hơn 0");
        }
      } else if (
        typeof updateData.userLimit === "object" &&
        typeof updateData.userLimit.min === "number" &&
        typeof updateData.userLimit.max === "number"
      ) {
        // trường hợp Cloud
        if (updateData.userLimit.min <= 0 || updateData.userLimit.max <= 0) {
          throw new Error("Giới hạn người dùng phải lớn hơn 0");
        }
        if (updateData.userLimit.min > updateData.userLimit.max) {
          throw new Error("Min không được lớn hơn max");
        }
      } else {
        throw new Error("userLimit không hợp lệ");
      }
    }

    return await this.licenseRepository.update(id, updateData);
  }

  /**
   * Xóa license theo ID.
   * @param id - ID của license cần xóa.
   * @returns `true` nếu xóa thành công, `false` nếu không tìm thấy.
   */
  async deleteLicense(id: string): Promise<boolean> {
    const exists = await this.licenseRepository.exists(id);
    if (!exists) {
      throw new Error("Không tìm thấy license");
    }

    return await this.licenseRepository.delete(id);
  }

  /**
   * Tìm license theo khoảng giá.
   * @param minPrice - Giá tối thiểu.
   * @param maxPrice - Giá tối đa.
   * @returns Danh sách license trong khoảng giá.
   */
  async getLicensesByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<ILicense[]> {
    if (minPrice < 0 || maxPrice < 0) {
      throw new Error("Giá trị phải không âm");
    }
    if (minPrice > maxPrice) {
      throw new Error("Giá tối thiểu không thể lớn hơn giá tối đa");
    }

    return await this.licenseRepository.findByPriceRange(minPrice, maxPrice);
  }

  /**
   * Tính tổng giá trị của tất cả license.
   * @returns Tổng giá trị của tất cả license.
   */
  async getTotalLicenseValue(categoryId: string): Promise<number> {
    return await this.licenseRepository.getTotalValue(categoryId);
  }

  /**
   * Đếm tổng số lượng license.
   * @returns Tổng số lượng license.
   */
  async getLicenseCount(): Promise<number> {
    return await this.licenseRepository.count();
  }
}
