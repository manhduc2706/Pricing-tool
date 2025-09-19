import { Router, type Router as ExpressRouter } from "express";
import categoryRoutes from "./categoryRoutes";
import deviceRoutes from "./deviceRoutes";
import licenseRoutes from "./licenseRoutes";
import quotationRoutes from "./quotationRoutes";
import itemDetailRoutes from "./itemDetailRoutes";
import costServerRoutes from "./costServerRoutes";
import fileRoutes from "./fileRoutes";
// import seedRoutes from "./seedRoutes";

const router: ExpressRouter = Router();

// Mount all routes
router.use("/categories", categoryRoutes);
router.use("/devices", deviceRoutes);
router.use("/costServer", costServerRoutes)
router.use("/licenses", licenseRoutes);
router.use("/itemDetail", itemDetailRoutes);
router.use("/quotations", quotationRoutes);
router.use("/fileImage", fileRoutes);
// router.use("/seed", seedRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Pricing Tool API',
        version: '1.0.0'
    });
});

export default router;
