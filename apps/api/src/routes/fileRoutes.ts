import { Router, type Router as ExpressRouter } from "express";
import { FileController } from "../controllers/File.controller";

const router: ExpressRouter = Router();
const fileController = new FileController();

router.post("/", fileController.create);

export default router;
