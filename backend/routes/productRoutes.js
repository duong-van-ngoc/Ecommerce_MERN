import express from "express";
import {
  getAllProducts,
  getSingleProduct,
  getAdminProducts,
  createReviewProduct,
  getReviewProduct,
  deleteReviewProduct,
  createProducts,
  updateProduct,
  deteteProduct
} from "../controllers/productController.js";

import { verifyUserAuth, roleBasedAccess } from "../middleware/userAuth.js";

const router = express.Router();

// ======================= PUBLIC ROUTES =======================
router.route("/products").get(getAllProducts);
router.route("/products/:id").get(getSingleProduct);

// ======================= ADMIN ROUTES =======================
router
  .route("/admin/products")
  .get(verifyUserAuth, roleBasedAccess("admin"), getAdminProducts);

router
  .route("/admin/products/create")
  .post(verifyUserAuth, roleBasedAccess("admin"), createProducts);

router
  .route("/admin/products/:id")
  .put(verifyUserAuth, roleBasedAccess("admin"), updateProduct)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deteteProduct);

// ======================= REVIEWS =======================
router.route("/review").put(verifyUserAuth, createReviewProduct);

router
  .route("/reviews")
  .get(verifyUserAuth, getReviewProduct)
  .delete(verifyUserAuth, deleteReviewProduct);

export default router;
