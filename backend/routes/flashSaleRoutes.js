import express from "express";
import { verifyUserAuth, roleBasedAccess } from "../middleware/userAuth.js";
import {
  addFlashSaleItem,
  cancelFlashSale,
  createFlashSale,
  deleteFlashSale,
  deleteFlashSaleItem,
  getActiveFlashSale,
  getAdminFlashSale,
  getAdminFlashSales,
  getProductFlashSale,
  getPublicFlashSale,
  getUpcomingFlashSales,
  publishFlashSale,
  updateFlashSale,
  updateFlashSaleItem,
} from "../controllers/flashSaleController.js";

const router = express.Router();

router
  .route("/admin/flash-sales")
  .post(verifyUserAuth, roleBasedAccess("admin"), createFlashSale)
  .get(verifyUserAuth, roleBasedAccess("admin"), getAdminFlashSales);

router
  .route("/admin/flash-sales/:id")
  .get(verifyUserAuth, roleBasedAccess("admin"), getAdminFlashSale)
  .put(verifyUserAuth, roleBasedAccess("admin"), updateFlashSale)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteFlashSale);

router
  .route("/admin/flash-sales/:id/publish")
  .post(verifyUserAuth, roleBasedAccess("admin"), publishFlashSale);

router
  .route("/admin/flash-sales/:id/cancel")
  .post(verifyUserAuth, roleBasedAccess("admin"), cancelFlashSale);

router
  .route("/admin/flash-sales/:id/items")
  .post(verifyUserAuth, roleBasedAccess("admin"), addFlashSaleItem);

router
  .route("/admin/flash-sales/:id/items/:itemId")
  .put(verifyUserAuth, roleBasedAccess("admin"), updateFlashSaleItem)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteFlashSaleItem);

router.route("/flash-sales/active").get(getActiveFlashSale);
router.route("/flash-sales/upcoming").get(getUpcomingFlashSales);
router.route("/flash-sales/:id").get(getPublicFlashSale);
router.route("/products/:id/flash-sale").get(getProductFlashSale);

export default router;
