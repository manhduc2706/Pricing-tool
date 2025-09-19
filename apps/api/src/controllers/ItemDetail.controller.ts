import { Request, Response } from "express";
import { ItemDetailService } from "../services/ItemDetail.service";
import { CreateItemDetailData } from "../repositories/ItemDetail.repository";

export class ItemDetailController {
  private itemDetailService: ItemDetailService;

  constructor() {
    this.itemDetailService = new ItemDetailService();

    // Bind all methods to this context
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.findByDevelopmentType = this.findByDevelopmentType.bind(this);
    this.searchByName = this.searchByName.bind(this);
  }

  /**
   * Tạo mới một ItemDetail.
   * @param req - Request chứa dữ liệu tạo mới.
   * @param res - Response trả về kết quả tạo mới.
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateItemDetailData = req.body;
      const item = await this.itemDetailService.createItemDetail(data);
      res.status(201).json({
        success: true,
        data: item,
        message: "Tạo item thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi tạo item",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Lấy tất cả các ItemDetail.
   * @param req - Request không yêu cầu dữ liệu.
   * @param res - Response trả về danh sách ItemDetail.
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.itemDetailService.getAllItemDetails();
      res.status(200).json({
        success: true,
        data: items,
        message: "Lấy item thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi lấy item",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Lấy một ItemDetail theo ID.
   * @param req - Request chứa ID của ItemDetail.
   * @param res - Response trả về ItemDetail hoặc lỗi nếu không tìm thấy.
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const item = await this.itemDetailService.getItemDetailById(
        req.params.id
      );
      if (item) {
        res.status(200).json({
          success: true,
          data: item,
          message: "Lấy item theo ID thành công",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "ItemDetail không tồn tại",
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi lấy item theo ID",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Cập nhật một ItemDetail theo ID.
   * @param req - Request chứa ID và dữ liệu cập nhật.
   * @param res - Response trả về kết quả cập nhật.
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const item = await this.itemDetailService.updateItemDetail(
        req.params.id,
        req.body
      );
      if (item) {
        res.status(200).json({
          success: true,
          data: item,
          message: "Cập nhật item thành công",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "ItemDetail không tồn tại",
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi cập nhật item",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Xóa một ItemDetail theo ID.
   * @param req - Request chứa ID của ItemDetail cần xóa.
   * @param res - Response trả về kết quả xóa.
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const success = await this.itemDetailService.deleteItemDetail(
        req.params.id
      );
      if (success) {
        res.status(204).json({
          success: true,
          message: "Xóa item thành công",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "ItemDetail không tồn tại",
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi xóa item",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Lấy các ItemDetail theo loại môi trường phát triển.
   * @param req - Request chứa loại môi trường (Cloud hoặc OnPremise).
   * @param res - Response trả về danh sách ItemDetail phù hợp.
   */
  async findByDevelopmentType(req: Request, res: Response): Promise<void> {
    try {
      const { developmentType } = req.params;
      // Validate giá trị hợp lệ trước khi truyền vào service
      if (developmentType !== "Cloud" && developmentType !== "OnPremise") {
        res.status(400).json({ error: "Invalid developmentType" });
        return;
      }
      const items =
        await this.itemDetailService.getItemDetailsByDevelopmentType(
          developmentType as "Cloud" | "OnPremise"
        );
      res.status(200).json({
        success: true,
        data: items,
        message: "Lấy item theo loại môi trường thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi lấy item theo loại môi trường",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Tìm kiếm các ItemDetail theo tên.
   * @param req - Request chứa tên cần tìm kiếm.
   * @param res - Response trả về danh sách ItemDetail phù hợp.
   */
  async searchByName(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.itemDetailService.searchItemDetailsByName(
        req.query.name as string
      );
      res.status(200).json({
        success: true,
        data: items,
        message: "Tìm kiếm item theo tên thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi tìm kiếm item theo tên",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }
}
