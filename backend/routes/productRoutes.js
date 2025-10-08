import express from "express";
import { getAllProducts, getSingleProduct, getAdminProducts, createReviewProduct, getReviewProduct, deleteReviewProduct} from "../controllers/productController.js";

import { createProducts , updateProduct , deteteProduct } from "../controllers/productController.js";
import { verifyUserAuth, roleBasedAccess} from "../middleware/userAuth.js";


const router = express.Router();

// Routes cho quan ly san pham
router.route("/products" )
.get(getAllProducts)

router.route("/admin/products" )
.get(getAdminProducts)

router.route("/admin/product/create" ).post(verifyUserAuth,roleBasedAccess("admin"), createProducts); // thêm sản phẩm mới

 // cập nhật, xóa, lấy sản phẩm đơn lẻ
router.route("/products/:id")
.put(verifyUserAuth,roleBasedAccess("admin"), updateProduct)
.delete(verifyUserAuth, roleBasedAccess("admin"), deteteProduct)
router.route("/products/:id").get( getSingleProduct);

router.route("/review").put(verifyUserAuth ,createReviewProduct);
router.route("/reviews").get(verifyUserAuth ,getReviewProduct)
.delete(verifyUserAuth ,deleteReviewProduct)




export default router;

