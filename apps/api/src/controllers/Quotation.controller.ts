import { Request, Response } from "express";
import { QuotationService } from "../services/Quotation.service";
import { Types } from "mongoose";
// import * as Types from 'mongoose';

export class QuotationController {
  private quotationService: QuotationService;

  constructor() {
    this.quotationService = new QuotationService();

    // Bind all methods to this context
    this.createQuotation = this.createQuotation.bind(this);
    this.downloadExcelForm = this.downloadExcelForm.bind(this);
  }

  /**
   * Tạo mới một báo giá.
   * @param req - Request chứa dữ liệu tạo mới.
   * @param res - Response trả về kết quả tạo mới.
   */
  async createQuotation(req: Request, res: Response): Promise<void> {
    try {
      // Map request data từ FE
      const requestData = {
        deploymentType: req.body.deploymentType,
        categoryId: new Types.ObjectId(req.body._id), // FE gửi _id là categoryId
        userCount: req.body.userCount,
        pointCount: req.body.pointCount,
        cameraCount: req.body.cameraCount,
        selectedFeatures: req.body.selectedFeatures || [], // Nhận selectedFeatures
        iconKey: req.body.iconKey, // Nhận iconKey để xác định loại service
      };

      const result = await this.quotationService.createQuotation(requestData);

      res.status(201).json({
        success: true,
        data: result,
        message: "Tạo báo giá thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi tạo báo giá",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }

  async downloadExcelForm(req: Request, res: Response): Promise<void> {
    try {
      // Map request data từ FE
      const requestData = {
        deploymentType: req.body.deploymentType,
        categoryId: new Types.ObjectId(req.body._id), // FE gửi _id là categoryId
        userCount: req.body.userCount,
        pointCount: req.body.pointCount,
        cameraCount: req.body.cameraCount,
        selectedFeatures: req.body.selectedFeatures || [], // Nhận selectedFeatures
        iconKey: req.body.iconKey, // Nhận iconKey để xác định loại service
      };

      const buffer = await this.quotationService.downloadExcel(requestData);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=quotation.xlsx"
      );

      res.end(buffer);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
}
