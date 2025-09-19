import { Request, Response } from "express";
import { CostServerService } from "../services/CostServer.service";
import { ICostServer } from "../models/CostServer.model";
import { CreateCostServer } from "../repositories/CostServer.repository";

export class CostServerController {
  private costServerService: CostServerService;

  constructor() {
    this.costServerService = new CostServerService();

    // Bind all methods to this context
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  /**
   * Lấy tất cả các CostServer.
   * @param req - Request không yêu cầu dữ liệu.
   * @param res - Response trả về danh sách CostServer.
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const costServers = await this.costServerService.getAll();

      res.status(200).json({
        success: true,
        data: costServers,
        count: costServers.length,
        message: "Lấy danh sách CostServer thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách CostServer",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Lấy một CostServer theo ID.
   * @param req - Request chứa ID của CostServer.
   * @param res - Response trả về CostServer hoặc lỗi nếu không tìm thấy.
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const costServer = await this.costServerService.getById(id);

      if (!costServer) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy CostServer",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: costServer,
        message: "Lấy CostServer thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi lấy CostServer",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Tạo mới một CostServer.
   * @param req - Request chứa dữ liệu tạo mới.
   * @param res - Response trả về kết quả tạo mới.
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateCostServer = req.body;
      const costServer = await this.costServerService.create(data);

      res.status(201).json({
        success: true,
        data: costServer,
        message: "Tạo CostServer thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi tạo CostServer",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Cập nhật một CostServer theo ID.
   * @param req - Request chứa ID và dữ liệu cập nhật.
   * @param res - Response trả về kết quả cập nhật.
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: Partial<ICostServer> = req.body;
      const costServer = await this.costServerService.update(id, updateData);

      if (!costServer) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy CostServer",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: costServer,
        message: "Cập nhật CostServer thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi cập nhật CostServer",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Xóa một CostServer theo ID.
   * @param req - Request chứa ID của CostServer cần xóa.
   * @param res - Response trả về kết quả xóa.
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.costServerService.delete(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy CostServer",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Xóa CostServer thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi xóa CostServer",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }
}
