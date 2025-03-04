const express = require("express");

const authController = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");
const configureMulter = require("../config/multer");

const uploadSingle = configureMulter({
  destinationFolder: "./uploads",
  maxSize: 2 * 1024 * 1024,
});

const router = express.Router();

router.post(
  "/signup",
  uploadSingle.single("profile_picture"),
  authController.signup
);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOtp);
router.post("/forget-password", authController.forgetPassword);
router.post("/reset-password", authController.resetPassword);
router.post(
  "/change-password",
  authenticate(["user", "restaurant"]),
  authController.changePassword
);

module.exports = router;
