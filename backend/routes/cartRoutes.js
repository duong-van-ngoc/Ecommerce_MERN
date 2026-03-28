import express from "express";
import { 
    getCart, 
    syncCart, 
    updateCartItem, 
    removeCartItem 
} from "../controllers/cartController.js";
import { verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.route("/cart").get(verifyUserAuth, getCart);
router.route("/cart/sync").post(verifyUserAuth, syncCart);
router.route("/cart/item").post(verifyUserAuth, updateCartItem);
router.route("/cart/item/remove").post(verifyUserAuth, removeCartItem);

export default router;
