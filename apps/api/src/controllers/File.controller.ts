import { FileService } from "../services/File.service";
import { CreateFile } from "../types/quotation";
import { Request, Response } from "express";


export class FileController {
  private fileService: FileService;

  constructor() {
    this.fileService = new FileService();

    // Bind all methods to this context
    this.create = this.create.bind(this);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateFile = req.body;
      const result = await this.fileService.create(data);

      res.status(201).json({
        success: true,
        data: result,
        message: "Tạo file ảnh thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Lỗi khi tạo file",
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      });
    }
  }
}
