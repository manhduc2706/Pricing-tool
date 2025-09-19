import { Router, type Router as ExpressRouter } from "express";
import { LicenseController } from "../controllers/License.controller";

const router: ExpressRouter = Router();
const licenseController = new LicenseController();

// Basic CRUD routes
router.post("/", licenseController.createLicense);
router.get("/", licenseController.getAllLicenses);
router.get("/:id", licenseController.getLicenseById);
router.put("/:id", licenseController.updateLicense);
router.delete("/:id", licenseController.deleteLicense);

// Filter routes
// router.get("/category/name/:categoryName", licenseController.getLicensesByCategoryName);
// router.get("/category/:categoryId", licenseController.getLicensesByCategoryId);
// router.get("/price-range/filter", licenseController.getLicensesByPriceRange);
// router.get("/vendor/search", licenseController.getLicensesByVendor);
// router.get("/user-limit/filter", licenseController.getLicensesByUserLimit);

// Search routes
// router.get("/search/name", licenseController.searchLicensesByName);

// Statistics routes
router.get("/count/total", licenseController.getLicenseCount);
router.get("/total-value/sum", licenseController.getTotalLicenseValue);

export default router;
