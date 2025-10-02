import express from 'express';
import { registerUser, loginUser, logout, requestPasswordReset} from '../controllers/userController.js';


const router = express.Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(logout)
router.route("/password/forgot").post(requestPasswordReset)

export default router;