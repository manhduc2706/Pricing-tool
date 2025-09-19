import { Router, type Router as ExpressRouter } from "express";
import { DeviceController } from "../controllers/Device.controller";

const router: ExpressRouter = Router();
const deviceController = new DeviceController();

// Basic CRUD routes
router.post("/", deviceController.createDevice); // Tạo mới thiết bị
router.get("/", deviceController.getAllDevices); // Lấy tất cả thiết bị
router.get("/:id", deviceController.getDeviceById); // Lấy thiết bị theo ID
router.put("/:id", deviceController.updateDevice); // Cập nhật thiết bị theo ID
router.delete("/:id", deviceController.deleteDevice); // Xóa thiết bị theo ID

// Filter routes
// router.get(
//   "/category/name/:categoryName",
//   deviceController.getDevicesByCategoryName
// ); // Lấy thiết bị theo tên danh mục
// router.get("/category/:categoryId", deviceController.getDevicesByCategoryId); // Lấy thiết bị theo ID danh mục

// Search routes
router.get("/search/name", deviceController.searchDevicesByName); // Tìm kiếm thiết bị theo tên

// Statistics routes
router.get("/count", deviceController.getDeviceCount); // Đếm tổng số lượng thiết bị
// router.get("/total-value", deviceController.getTotalDeviceValue); // Tính tổng giá trị của tất cả thiết bị

export default router;
