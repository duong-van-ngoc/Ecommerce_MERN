import express from "express";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";
import { allMyOrder, createNewOrder, getSingleOrder } from "../controllers/orderController.js";


const router = express.Router()



router.route("/order/new").post(verifyUserAuth, createNewOrder)
router.route("/admin/order/:id").post(verifyUserAuth,roleBasedAccess('admin'), getSingleOrder)
router.route("/orders/user").get(verifyUserAuth, allMyOrder)




export default router