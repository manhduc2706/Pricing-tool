import { Request, Response } from "express";
import { DeviceService } from "../services/Device.service";
import { CreateDeviceData } from "../repositories/Device.repository";

export class DeviceController {
  private deviceService: DeviceService;

  constructor() {
    this.deviceService = new DeviceService();

    // Bind all methods to this context
    this.createDevice = this.createDevice.bind(this);
    this.getAllDevices = this.getAllDevices.bind(this);
    this.getDeviceById = this.getDeviceById.bind(this);
    this.updateDevice = this.updateDevice.bind(this);
    this.deleteDevice = this.deleteDevice.bind(this);
    this.searchDevicesByName = this.searchDevicesByName.bind(this);
    this.getDeviceCount = this.getDeviceCount.bind(this);
  }

  /**
   * Tạo mới một thiết bị.
   * @param req - Request chứa dữ liệu tạo mới.
   * @param res - Response trả về kết quả tạo mới.
   */
  async createDevice(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateDeviceData = req.body;
      const result = await this.deviceService.createDevice(data);

      res.status(201).json({
        success: true,
        data: result,
        message: "Tạo thiết bị thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi tạo thiết bị",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Lấy tất cả các thiết bị.
   * @param req - Request không yêu cầu dữ liệu.
   * @param res - Response trả về danh sách thiết bị.
   */
  async getAllDevices(req: Request, res: Response): Promise<void> {
    try {
      const devices = await this.deviceService.getAllDevices();

      res.json({
        success: true,
        data: devices,
        count: devices.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách thiết bị",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Lấy một thiết bị theo ID.
   * @param req - Request chứa ID của thiết bị.
   * @param res - Response trả về thiết bị hoặc lỗi nếu không tìm thấy.
   */
  async getDeviceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const device = await this.deviceService.getDeviceById(id);

      if (!device) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy thiết bị",
        });
        return;
      }

      res.json({
        success: true,
        data: device,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi lấy thiết bị",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Cập nhật một thiết bị theo ID.
   * @param req - Request chứa ID và dữ liệu cập nhật.
   * @param res - Response trả về kết quả cập nhật.
   */
  async updateDevice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const device = await this.deviceService.updateDevice(id, updateData);

      if (!device) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy thiết bị",
        });
        return;
      }

      res.json({
        success: true,
        data: device,
        message: "Cập nhật thiết bị thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi cập nhật thiết bị",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Xóa một thiết bị theo ID.
   * @param req - Request chứa ID của thiết bị cần xóa.
   * @param res - Response trả về kết quả xóa.
   */
  async deleteDevice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.deviceService.deleteDevice(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy thiết bị",
        });
        return;
      }

      res.json({
        success: true,
        message: "Xóa thiết bị thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi xóa thiết bị",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Tìm kiếm các thiết bị theo tên.
   * @param req - Request chứa tên cần tìm kiếm.
   * @param res - Response trả về danh sách thiết bị phù hợp.
   */
  async searchDevicesByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.query;
      if (!name || typeof name !== "string") {
        res.status(400).json({
          success: false,
          message: "Tên tìm kiếm không hợp lệ",
        });
        return;
      }

      const devices = await this.deviceService.searchDevicesByName(name);

      res.json({
        success: true,
        data: devices,
        count: devices.length,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi tìm kiếm thiết bị",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }
  
  /**
   * Đếm tổng số lượng thiết bị.
   * @param req - Request không yêu cầu dữ liệu.
   * @param res - Response trả về tổng số lượng thiết bị.
   */
  async getDeviceCount(req: Request, res: Response): Promise<void> {
    try {
      const count = await this.deviceService.getDeviceCount();

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi đếm thiết bị",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }
}
