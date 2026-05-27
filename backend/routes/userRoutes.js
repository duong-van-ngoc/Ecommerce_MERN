
import express from 'express';
import passport from 'passport';
import { registerUser, loginUser, logout, requestPasswordReset, resetPassword, getUserDetails, updatePassword, updateProfile, getUsersList, getSingleUser, updateUserRole, toggleUserStatus } from '../controllers/userController.js';
import { roleBasedAccess, verifyUserAuth } from '../middleware/userAuth.js';
import { getFrontendBaseUrl } from '../config/runtimeConfig.js';

const router = express.Router();

const authenticateOAuthCallback = (strategy) => (req, res, next) => {
    passport.authenticate(strategy, {
        session: false,
        failureRedirect: `${getFrontendBaseUrl()}/login`
    })(req, res, next);
};

const handleOAuthSuccess = (req, res) => {
    const user = req.user;
    const frontendUrl = getFrontendBaseUrl();

    if (!user) return res.redirect(`${frontendUrl}/login`);

    const token = user.getJWTToken();
    const isProduction = process.env.NODE_ENV === "production";

    const options = {
        expires: new Date(Date.now() + Number(process.env.EXPIRE_COOKIE || 5) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    };

    res.status(200).cookie("token", token, options).redirect(`${frontendUrl}/login/success?token=${encodeURIComponent(token)}`);
};

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(logout)

// Social Login Routes

// Google OAuth
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", authenticateOAuthCallback("google"), handleOAuthSuccess);

// Facebook OAuth
router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["public_profile", "email"] }));
router.get("/auth/facebook/callback", authenticateOAuthCallback("facebook"), handleOAuthSuccess);


router.route("/password/forgot").post(requestPasswordReset)
router.route("/reset/:token").post(resetPassword)
router.route("/profile").get(verifyUserAuth, getUserDetails)
router.route("/password/update").put(verifyUserAuth, updatePassword)
router.route("/profile/update").put(verifyUserAuth, updateProfile)
router.route("/admin/users").get(verifyUserAuth, roleBasedAccess('admin'), getUsersList)
router.route("/admin/users/:id")
    .get(verifyUserAuth, roleBasedAccess('admin'), getSingleUser)
    .put(verifyUserAuth, roleBasedAccess('admin'), updateUserRole)
router.route("/admin/users/:id/toggle-status")
    .put(verifyUserAuth, roleBasedAccess('admin'), toggleUserStatus)







export default router;
