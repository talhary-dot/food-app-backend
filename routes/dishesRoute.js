const express = require("express");
const router = express.Router();
const dishController = require("../controllers/dishesController");
const authenticate = require("../middleware/authMiddleware");


router.use(authenticate(["restaurant", "user"]));
// Create a new dish
router.post("/", dishController.createDish);

// Update a dish
router.put("/:id", dishController.updateDish
    
);

// Delete a dish
router.delete("/:id", dishController.deleteDish);

// Get a single dish
router.get("/:id", dishController.getDish);
// Get all  for a restaurant
router.get("/", dishController.getAllDishes);

module.exports = router;
