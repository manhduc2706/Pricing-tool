import { Router, type Router as ExpressRouter } from "express";
import { ItemDetailController } from "../controllers/ItemDetail.controller";

const router: ExpressRouter = Router();
const itemDetailController = new ItemDetailController();

// Basic CRUD routes
router.post("/", itemDetailController.create); // Tạo mới thiết bị
router.get("/", itemDetailController.getAll); // Lấy tất cả thiết bị
router.get("/:id", itemDetailController.getById); // Lấy thiết bị theo ID
router.put("/:id", itemDetailController.update); // Cập nhật thiết bị theo ID
router.delete("/:id", itemDetailController.delete); // Xóa thiết bị theo ID

export default router;
