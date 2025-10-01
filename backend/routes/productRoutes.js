import express from "express";
import { getAllProducts, getSingleProduct } from "../controllers/productController.js";

import { createProducts , updateProduct , deteteProduct } from "../controllers/productController.js";
import { verifyUserAuth } from "../middleware/userAuth.js";


const router = express.Router();

// Routes cho quan ly san pham
router.route("/products" )
.get(verifyUserAuth, getAllProducts)
.post(createProducts); // thêm sản phẩm mới

 // cập nhật, xóa, lấy sản phẩm đơn lẻ
router.route("/products/:id")
.put(updateProduct)
.delete(deteteProduct)
.get(getSingleProduct);

export default router;
