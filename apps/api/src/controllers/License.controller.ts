import { Request, Response } from "express";
import { LicenseService } from "../services/License.service";
import { CreateLicenseData } from "../repositories/License.repository";

export class LicenseController {
  private licenseService: LicenseService;

  constructor() {
    this.licenseService = new LicenseService();

    // Bind all methods to this context
    this.createLicense = this.createLicense.bind(this);
    this.getAllLicenses = this.getAllLicenses.bind(this);
    this.getLicenseById = this.getLicenseById.bind(this);
    this.getLicensesByCategoryId = this.getLicensesByCategoryId.bind(this);
    this.updateLicense = this.updateLicense.bind(this);
    this.deleteLicense = this.deleteLicense.bind(this);
    this.getTotalLicenseValue = this.getTotalLicenseValue.bind(this);
    this.getLicenseCount = this.getLicenseCount.bind(this);
  }

  /**
   * Tạo mới một license.
   * @param req - Request chứa dữ liệu tạo mới.
   * @param res - Response trả về kết quả tạo mới.
   */
  async createLicense(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateLicenseData = req.body;
      const license = await this.licenseService.createLicense(data);

      res.status(201).json({
        success: true,
        data: license,
        message: "Tạo license thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi tạo license",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Lấy tất cả các license.
   * @param req - Request không yêu cầu dữ liệu.
   * @param res - Response trả về danh sách license.
   */
  async getAllLicenses(req: Request, res: Response): Promise<void> {
    try {
      const licenses = await this.licenseService.getAllLicenses();

      res.json({
        success: true,
        data: licenses,
        count: licenses.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách licenses",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Lấy một license theo ID.
   * @param req - Request chứa ID của license.
   * @param res - Response trả về license hoặc lỗi nếu không tìm thấy.
   */
  async getLicenseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const license = await this.licenseService.getLicenseById(id);

      if (!license) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy license",
        });
        return;
      }

      res.json({
        success: true,
        data: license,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi lấy license",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Lấy danh sách license theo ID danh mục.
   * @param req - Request chứa ID danh mục.
   * @param res - Response trả về danh sách license thuộc danh mục.
   */
  async getLicensesByCategoryId(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const licenses = await this.licenseService.getLicensesByCategoryId(
        categoryId
      );

      res.json({
        success: true,
        data: licenses,
        count: licenses.length,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi lấy licenses theo category ID",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Cập nhật một license theo ID.
   * @param req - Request chứa ID và dữ liệu cập nhật.
   * @param res - Response trả về kết quả cập nhật.
   */
  async updateLicense(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const license = await this.licenseService.updateLicense(id, updateData);

      if (!license) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy license",
        });
        return;
      }

      res.json({
        success: true,
        data: license,
        message: "Cập nhật license thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi cập nhật license",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Xóa một license theo ID.
   * @param req - Request chứa ID của license cần xóa.
   * @param res - Response trả về kết quả xóa.
   */
  async deleteLicense(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.licenseService.deleteLicense(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy license",
        });
        return;
      }

      res.json({
        success: true,
        message: "Xóa license thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi xóa license",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Tính tổng giá trị của tất cả license.
   * @param req - Request không yêu cầu dữ liệu.
   * @param res - Response trả về tổng giá trị license.
   */
  async getTotalLicenseValue(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.query; // lấy categoryId từ query
      if (!categoryId || typeof categoryId !== "string") {
        res.status(400).json({
          success: false,
          message: "Thiếu hoặc sai định dạng categoryId",
        });
        return;
      }
      const totalValue = await this.licenseService.getTotalLicenseValue(
        categoryId
      );

      res.json({
        success: true,
        data: { totalValue },
        message: "Lấy tổng giá trị licenses thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi tính tổng giá trị licenses",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  /**
   * Đếm tổng số lượng license.
   * @param req - Request không yêu cầu dữ liệu.
   * @param res - Response trả về tổng số lượng license.
   */
  async getLicenseCount(req: Request, res: Response): Promise<void> {
    try {
      const count = await this.licenseService.getLicenseCount();

      res.json({
        success: true,
        data: { count },
        message: "Lấy số lượng licenses thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi đếm licenses",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }
}
