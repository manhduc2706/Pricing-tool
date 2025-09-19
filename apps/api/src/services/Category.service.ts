import {
  CategoryRepository,
  CreateCategoryData,
} from "../repositories/Category.repository";
import { ICategory } from "../models/Category.model";

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async createCategory(data: CreateCategoryData): Promise<ICategory> {
    // Validate dữ liệu đầu vào
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Tên category không được để trống");
    }

    if (!data.iconKey || data.iconKey.trim().length === 0) {
      throw new Error("Icon key không được để trống");
    }

    // Kiểm tra category name đã tồn tại
    const existingCategory = await this.categoryRepository.findByName(
      data.name.trim()
    );
    if (existingCategory) {
      throw new Error("Category name đã tồn tại");
    }

    // Chuẩn hóa dữ liệu
    const processedData: CreateCategoryData = {
      name: data.name.trim(),
      iconKey: data.iconKey.trim(),
    };

    return await this.categoryRepository.create(processedData);
  }

  async getAllCategories(): Promise<ICategory[]> {
    return await this.categoryRepository.findAll();
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    return await this.categoryRepository.findById(id);
  }

  async getCategoryByName(name: string): Promise<ICategory | null> {
    if (!name || name.trim().length === 0) {
      throw new Error("Category name không được để trống");
    }
    return await this.categoryRepository.findByName(name.trim());
  }

  async updateCategory(
    id: string,
    updateData: Partial<ICategory>
  ): Promise<ICategory | null> {
    // Validate dữ liệu cập nhật
    if (updateData.name && updateData.name.trim().length === 0) {
      throw new Error("Tên category không được để trống");
    }

    if (updateData.iconKey && updateData.iconKey.trim().length === 0) {
      throw new Error("Icon key không được để trống");
    }

    // Kiểm tra name mới có trùng không (nếu có cập nhật)
    if (updateData.name) {
      const existingCategory = await this.categoryRepository.findByName(
        updateData.name.trim()
      );
    }

    // Chuẩn hóa dữ liệu
    const processedData = { ...updateData };
    if (processedData.name) {
      processedData.name = processedData.name.trim();
    }
    if (processedData.iconKey) {
      processedData.iconKey = processedData.iconKey.trim();
    }

    return await this.categoryRepository.update(id, processedData);
  }

  async deleteCategory(id: string): Promise<boolean> {
    const exists = await this.categoryRepository.exists(id);
    if (!exists) {
      throw new Error("Không tìm thấy category");
    }

    return await this.categoryRepository.delete(id);
  }

  async searchCategoriesByName(name: string): Promise<ICategory[]> {
    if (!name || name.trim().length === 0) {
      throw new Error("Tên tìm kiếm không được để trống");
    }
    return await this.categoryRepository.searchByName(name.trim());
  }

  async getCategoryCount(): Promise<number> {
    return await this.categoryRepository.count();
  }
}


