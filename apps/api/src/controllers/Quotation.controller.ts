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
    this.updateQuotationItem = this.updateQuotationItem.bind(this)
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
        siteCount: req.body.siteCount,
        siteLocation: req.body.siteLocation,
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

  async updateQuotationItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { type, updatedItemId } = req.body;

      if (!type || !updatedItemId) {
        return res.status(400).json({
          message: "Thiếu tham số: type hoặc updatedItemId",
        });
      }

      const updatedQuotation = await this.quotationService.updateQuotationItem(
        id,
        type,
        updatedItemId
      );

      return res.status(200).json({
        message: "Cập nhật thành công",
        data: updatedQuotation,
      });
    } catch (error: any) {
      console.error("Lỗi updateQuotationItem:", error);
      return res.status(500).json({
        message: "Lỗi khi cập nhật báo giá",
        error: error.message,
      });
    }
  }


  async downloadExcelForm(req: Request, res: Response): Promise<void> {
    try {
      // Map request data từ FE
      const requestData = req.body;
      console.log(requestData)

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
