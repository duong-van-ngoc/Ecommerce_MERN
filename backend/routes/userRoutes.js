import express from 'express';
import { registerUser, loginUser, logout, requestPasswordReset, resetPassword, getUserDetails, updatePassword, updateProfile, getUsersList, getSingleUser, updateUserRole, deleteProfile} from '../controllers/userController.js';
import { roleBasedAccess, verifyUserAuth } from '../middleware/userAuth.js';

const router = express.Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(logout)
router.route("/password/forgot").post(requestPasswordReset)
router.route("/reset/:token").post(resetPassword)
router.route("/profile").post(verifyUserAuth, getUserDetails)
router.route("/password/update").post(verifyUserAuth, updatePassword)
router.route("/profile/update").post(verifyUserAuth, updateProfile)
router.route("/admin/users").get(verifyUserAuth, roleBasedAccess('admin'), getUsersList)
router.route("/admin/users/:id")
.get(verifyUserAuth, roleBasedAccess('admin'), getSingleUser)
.put(verifyUserAuth, roleBasedAccess('admin'), updateUserRole)
.delete(verifyUserAuth, roleBasedAccess('admin'), deleteProfile)







export default router;