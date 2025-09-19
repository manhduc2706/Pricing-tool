import { Router, type Router as ExpressRouter } from "express";
import { CostServerController } from "../controllers/CostServer.controller";

const router: ExpressRouter = Router();
const controller = new CostServerController();

// Định nghĩa các route
router.get("/", (req, res) => controller.getAll(req, res)); // Lấy tất cả
router.get("/:id", (req, res) => controller.getById(req, res)); // Lấy theo ID
router.post("/", (req, res) => controller.create(req, res)); // Tạo mới
router.put("/:id", (req, res) => controller.update(req, res)); // Cập nhật
router.delete("/:id", (req, res) => controller.delete(req, res)); // Xóa

export default router;
