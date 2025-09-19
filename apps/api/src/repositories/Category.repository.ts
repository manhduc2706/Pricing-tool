import { Types } from "mongoose";
import { CategoryModel, ICategory } from "../models/Category.model";

export interface CreateCategoryData {
  name: string;
  iconKey: string;
}

export class CategoryRepository {
  // Tạo mới category
  async create(data: CreateCategoryData): Promise<ICategory> {
    const newCategory = new CategoryModel(data);
    return await newCategory.save();
  }

  // Lấy tất cả categories
  async findAll(): Promise<ICategory[]> {
    return await CategoryModel.find();
  }

  async findById(id: string): Promise<ICategory | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId");
    }
    const objectId = new Types.ObjectId(id);
    return await CategoryModel.findById(objectId);
  }

  // Lấy category theo name
  async findByName(name: string): Promise<ICategory | null> {
    return await CategoryModel.findOne({ name });
  }

  // Cập nhật category
  async update(
    id: string,
    updateData: Partial<ICategory>
  ): Promise<ICategory | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId");
    }

    const objectId = new Types.ObjectId(id);
    return await CategoryModel.findByIdAndUpdate(objectId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // Xóa category
  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId");
    }

    const objectId = new Types.ObjectId(id);
    const result = await CategoryModel.findByIdAndDelete(objectId);
    return !!result;
  }

  // Kiểm tra tồn tại theo _id
  async exists(id: string): Promise<boolean> {
    const objectId = new Types.ObjectId(id);
    if (!Types.ObjectId.isValid(objectId)) {
      return false;
    }

    const count = await CategoryModel.countDocuments({ _id: objectId });
    return count > 0;
  }

  // Tìm kiếm theo tên
  async searchByName(name: string): Promise<ICategory[]> {
    return await CategoryModel.find({
      name: { $regex: name, $options: "i" },
    });
  }

  // Đếm tổng số categories
  async count(): Promise<number> {
    return await CategoryModel.countDocuments();
  }
}
