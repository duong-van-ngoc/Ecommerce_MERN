import express from "express";
import { getAllProducts, getSingleProduct } from "../controller/productController.js";

import { createProducts , updateProduct , deteteProduct } from "../controller/productController.js";



const router = express.Router();

// Routes cho quan ly san pham
router.route("/products" )
.get(getAllProducts)
.post(createProducts); // thêm sản phẩm mới

 // cập nhật, xóa, lấy sản phẩm đơn lẻ
router.route("/products/:id")
.put(updateProduct)
.delete(deteteProduct)
.get(getSingleProduct);

export default router;
