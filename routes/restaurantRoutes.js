const express = require("express");

const restaurantController = require("../controllers/restaurantController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();
const configureMulter = require("../config/multer");

const uploadSingle = configureMulter({
  destinationFolder: "./uploads",
  maxSize: 2 * 1024 * 1024,
});
// Authentication Routes
router.post(
  "/signup",
  uploadSingle.single("profile_picture"),
  restaurantController.signup
);
router.post("/verify-otp", restaurantController.verifyOtp);
router.post("/login", restaurantController.login);
//Profile
router.get(
  "/profile",
  authenticate(["restaurant"]),
  restaurantController.fetchRestaurantDetails
);
router.get(
  "/profile/:id",
  authenticate(["user"]),
  restaurantController.fetchRestaurantDetails
);
router.post(
  "/:id",
  authenticate(["restaurant"]),
  restaurantController.updateRestaurantProfile
);

router.get(
  "/get",
  authenticate(["user"]),
  restaurantController.fetchAllRestaurants
);

router.get(
  "/orders",
  authenticate(["restaurant"]),
  restaurantController.getAllOrder
);
//Search
router.get("/search", restaurantController.searchRestaurants);

module.exports = router;
