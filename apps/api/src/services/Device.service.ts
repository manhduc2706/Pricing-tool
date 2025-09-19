import {
  DeviceRepository,
  CreateDeviceData,
} from "../repositories/Device.repository";
import { IDevice } from "../models/Device.model";
import { CategoryService } from "../services/Category.service";

export class DeviceService {
  private deviceRepository: DeviceRepository;
  private categoryService: CategoryService;

  constructor() {
    this.deviceRepository = new DeviceRepository();
    this.categoryService = new CategoryService();
  }

  /**
   * Tạo mới một thiết bị.
   * @param data - Dữ liệu cần thiết để tạo thiết bị.
   * @returns Thiết bị vừa được tạo.
   */
  async createDevice(data: CreateDeviceData): Promise<IDevice> {
    // Validate dữ liệu đầu vào
    // if (!data.itemType || data.itemType.trim().length === 0) {
    //   throw new Error("Loại thiết bị không được để trống");
    // }

    // Chuẩn hóa dữ liệu
    const processedData: CreateDeviceData = {
      ...data,
      // itemType: data.itemType.trim(),
    };

    return await this.deviceRepository.create(processedData);
  }

  /**
   * Lấy tất cả các thiết bị.
   * @returns Danh sách tất cả các thiết bị.
   */
  async getAllDevices(): Promise<IDevice[]> {
    return await this.deviceRepository.findAll();
  }

  /**
   * Lấy thiết bị theo ID.
   * @param id - ID của thiết bị cần tìm.
   * @returns Thiết bị nếu tìm thấy, hoặc null nếu không tồn tại.
   */
  async getDeviceById(id: string): Promise<IDevice | null> {
    return await this.deviceRepository.findById(id);
  }

  /**
   * Lấy thiết bị theo tên danh mục.
   * @param categoryName - Tên danh mục.
   * @returns Danh sách thiết bị thuộc danh mục.
   */
  async getDevicesByCategoryName(categoryName: string): Promise<IDevice[]> {
    if (!categoryName || categoryName.trim().length === 0) {
      throw new Error("Tên danh mục không được để trống");
    }

    // Tìm category theo name để lấy _id
    const category = await this.categoryService.getCategoryByName(
      categoryName.trim()
    );
    if (!category) {
      throw new Error("Không tìm thấy danh mục");
    }

    // Sử dụng _id của category để tìm devices
    return await this.deviceRepository.findByCategoryId(
      category._id.toString()
    );
  }

  /**
   * Lấy thiết bị theo ID danh mục.
   * @param categoryId - ID của danh mục.
   * @returns Danh sách thiết bị thuộc danh mục.
   */
  async getDevicesByCategoryId(categoryId: string): Promise<IDevice[]> {
    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error("ID danh mục không được để trống");
    }
    return await this.deviceRepository.findByCategoryId(categoryId.trim());
  }

  /**
   * Cập nhật thiết bị theo ID.
   * @param id - ID của thiết bị cần cập nhật.
   * @param updateData - Dữ liệu cần cập nhật.
   * @returns Thiết bị sau khi cập nhật, hoặc null nếu không tồn tại.
   */
  async updateDevice(
    id: string,
    updateData: Partial<CreateDeviceData>
  ): Promise<IDevice | null> {
    // Validate dữ liệu cập nhật
    // if (updateData.itemType && updateData.itemType.trim().length === 0) {
    //   throw new Error("Loại thiết bị không được để trống");
    // }

    // Chuẩn hóa dữ liệu
    const processedData = { ...updateData };
    // if (processedData.itemType) {
    //   processedData.itemType = processedData.itemType.trim();
    // }

    return await this.deviceRepository.update(id, processedData);
  }

  /**
   * Xóa thiết bị theo ID.
   * @param id - ID của thiết bị cần xóa.
   * @returns `true` nếu xóa thành công, `false` nếu không tìm thấy.
   */
  async deleteDevice(id: string): Promise<boolean> {
    const exists = await this.deviceRepository.findById(id);
    if (!exists) {
      throw new Error("Không tìm thấy thiết bị");
    }

    return await this.deviceRepository.delete(id);
  }

  /**
   * Lấy thiết bị theo khoảng giá.
   * @param minPrice - Giá tối thiểu.
   * @param maxPrice - Giá tối đa.
   * @returns Danh sách thiết bị trong khoảng giá.
   */
  // async getDevicesByPriceRange(
  //   minPrice: number,
  //   maxPrice: number
  // ): Promise<IDevice[]> {
  //   if (minPrice < 0 || maxPrice < 0) {
  //     throw new Error("Giá trị phải không âm");
  //   }
  //   if (minPrice > maxPrice) {
  //     throw new Error("Giá tối thiểu không thể lớn hơn giá tối đa");
  //   }

  //   return await this.deviceRepository.findByPriceRange(minPrice, maxPrice);
  // }

  /**
   * Lấy thiết bị theo nhà cung cấp.
   * @param vendor - Tên nhà cung cấp.
   * @returns Danh sách thiết bị thuộc nhà cung cấp.
   */
  // async getDevicesByVendor(vendor: string): Promise<IDevice[]> {
  //   if (!vendor || vendor.trim().length === 0) {
  //     throw new Error("Tên nhà cung cấp không được để trống");
  //   }
  //   return await this.deviceRepository.findByVendor(vendor.trim());
  // }

  /**
   * Tìm kiếm thiết bị theo tên.
   * @param name - Tên thiết bị cần tìm kiếm.
   * @returns Danh sách thiết bị phù hợp.
   */
  async searchDevicesByName(name: string): Promise<IDevice[]> {
    if (!name || name.trim().length === 0) {
      throw new Error("Tên tìm kiếm không được để trống");
    }
    return await this.deviceRepository.searchByName(name.trim());
  }

  /**
   * Tính tổng giá trị của tất cả thiết bị.
   * @returns Tổng giá trị của tất cả thiết bị.
   */
  async getTotalDeviceValue(categoryId: string): Promise<number> {
    return await this.deviceRepository.getTotalValue(categoryId);
  }

  /**
   * Đếm tổng số lượng thiết bị.
   * @returns Tổng số lượng thiết bị.
   */
  async getDeviceCount(): Promise<number> {
    return await this.deviceRepository.count();
  }
}
