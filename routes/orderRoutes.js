const express = require("express");

const orderController = require("../controllers/orderController.js");
const authenticate = require("../middleware/authMiddleware.js");

const router = express.Router();

// Place an order
router.post("/place", authenticate(["user"]), orderController.placeOrder);

// Get all orders for a customer
router.get("/get", authenticate(["user"]), orderController.getCustomerOrders);

// Get order details
router.get(
  "/:id",
  authenticate(["user", "restaurant"]),
  orderController.getOrderDetails
);

router.put(
  "/:id/status",
  authenticate(["restaurant"]),
  orderController.updateOrderStatus
);

module.exports = router;
