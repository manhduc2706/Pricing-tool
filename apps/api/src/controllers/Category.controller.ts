import { Request, Response } from "express";
import { CategoryService } from "../services/Category.service";
import { CreateCategoryData } from "../repositories/Category.repository";

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();

    // Bind all methods to this context
    this.createCategory = this.createCategory.bind(this);
    this.getAllCategories = this.getAllCategories.bind(this);
    this.getCategoryById = this.getCategoryById.bind(this);
    this.getCategoryByName = this.getCategoryByName.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.searchCategoriesByName = this.searchCategoriesByName.bind(this);
    this.getCategoryCount = this.getCategoryCount.bind(this);
  }

  /**
   * Tạo mới một danh mục.
   * @param req - Request chứa dữ liệu tạo mới.
   * @param res - Response trả về kết quả tạo mới.
   */
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateCategoryData = req.body;
      const result = await this.categoryService.createCategory(data);

      res.status(201).json({
        success: true,
        data: result,
        message: "Tạo category thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi tạo category",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Lấy tất cả các danh mục.
   * @param req - Request không yêu cầu dữ liệu.
   * @param res - Response trả về danh sách danh mục.
   */
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.categoryService.getAllCategories();

      res.json({
        success: true,
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách categories",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Lấy một danh mục theo ID.
   * @param req - Request chứa ID của danh mục.
   * @param res - Response trả về danh mục hoặc lỗi nếu không tìm thấy.
   */
  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(id);

      if (!category) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy category",
        });
        return;
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi lấy category",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Lấy một danh mục theo tên.
   * @param req - Request chứa tên của danh mục.
   * @param res - Response trả về danh mục hoặc lỗi nếu không tìm thấy.
   */
  async getCategoryByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const category = await this.categoryService.getCategoryByName(name);

      if (!category) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy category",
        });
        return;
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi lấy category",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Cập nhật một danh mục theo ID.
   * @param req - Request chứa ID và dữ liệu cập nhật.
   * @param res - Response trả về kết quả cập nhật.
   */
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const category = await this.categoryService.updateCategory(
        id,
        updateData
      );

      if (!category) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy category",
        });
        return;
      }

      res.json({
        success: true,
        data: category,
        message: "Cập nhật category thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi cập nhật category",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Xóa một danh mục theo ID.
   * @param req - Request chứa ID của danh mục cần xóa.
   * @param res - Response trả về kết quả xóa.
   */
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.categoryService.deleteCategory(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy category",
        });
        return;
      }

      res.json({
        success: true,
        message: "Xóa category thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi xóa category",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Tìm kiếm các danh mục theo tên.
   * @param req - Request chứa tên cần tìm kiếm.
   * @param res - Response trả về danh sách danh mục phù hợp.
   */
  async searchCategoriesByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.query;

      if (!name || typeof name !== "string") {
        res.status(400).json({
          success: false,
          message: "Cần cung cấp tên để tìm kiếm",
        });
        return;
      }

      const categories = await this.categoryService.searchCategoriesByName(
        name
      );

      res.json({
        success: true,
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi tìm kiếm categories",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Đếm tổng số lượng danh mục.
   * @param req - Request không yêu cầu dữ liệu.
   * @param res - Response trả về tổng số lượng danh mục.
   */
  async getCategoryCount(req: Request, res: Response): Promise<void> {
    try {
      const count = await this.categoryService.getCategoryCount();

      res.json({
        success: true,
        data: { count },
        message: "Lấy số lượng categories thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi đếm categories",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }
}
