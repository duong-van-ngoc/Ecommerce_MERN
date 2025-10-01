import express from "express";
import { getAllProducts, getSingleProduct } from "../controllers/productController.js";

import { createProducts , updateProduct , deteteProduct } from "../controllers/productController.js";
import { verifyUserAuth, roleBasedAccess} from "../middleware/userAuth.js";


const router = express.Router();

// Routes cho quan ly san pham
router.route("/products" )
.get(verifyUserAuth, getAllProducts)
.post(verifyUserAuth,roleBasedAccess("admin"), createProducts); // thêm sản phẩm mới

 // cập nhật, xóa, lấy sản phẩm đơn lẻ
router.route("/products/:id")
.put(verifyUserAuth,roleBasedAccess("admin"), updateProduct)
.delete(verifyUserAuth, roleBasedAccess("admin"), deteteProduct)
.get(verifyUserAuth, getSingleProduct);

export default router;
