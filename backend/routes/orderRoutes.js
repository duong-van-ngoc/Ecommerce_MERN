import express from "express";
import { verifyUserAuth } from "../middleware/userAuth.js";
import { createNewOrder } from "../controllers/orderController.js";


const router = express.Router()



router.route("/order/new").post(verifyUserAuth, createNewOrder)


export default router