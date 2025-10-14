import { Router, type Router as ExpressRouter } from "express";
import { QuotationController } from "../controllers/Quotation.controller";

const router: ExpressRouter = Router();
const quotationController = new QuotationController();

// Basic CRUD routes
router.post("/", quotationController.createQuotation); // Tạo mới báo giá
router.patch("/:id/update", quotationController.updateQuotationItem); //update
router.post("/createExcel", quotationController.downloadExcelForm);
export default router;
