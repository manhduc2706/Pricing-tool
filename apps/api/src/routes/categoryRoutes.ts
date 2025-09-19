import { Router, type Router as ExpressRouter } from "express";
import { CategoryController } from "../controllers/Category.controller";

const router: ExpressRouter = Router();
const categoryController = new CategoryController();

// Basic CRUD routes
router.post("/", categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

// Search routes
router.get("/search/name", categoryController.searchCategoriesByName);
router.get("/name/:name", categoryController.getCategoryByName);

// Statistics routes
router.get("/count/total", categoryController.getCategoryCount);

export default router;
