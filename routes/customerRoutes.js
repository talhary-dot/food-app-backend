const express = require("express");

const customerController = require("../controllers/customerController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Authentication Routes
router.post("/signup", customerController.signup);
router.post("/login", customerController.login);
router.post("/resend-otp", customerController.resendOtp);
router.post("/verify-otp", customerController.verifyOtp);

// User Profile
router.get(
  "/profile",
  authenticate(["user"]),
  customerController.fetchCustomerDetails
);
router.get(
  "/profile/:id",
  authenticate(["restaurant"]),
  customerController.fetchCustomerDetails
);

module.exports = router;
