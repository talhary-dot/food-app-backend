const express = require("express");

const menuController = require("../controllers/menuController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();
const configureMulter = require("../config/multer");
const upload = configureMulter({ destinationFolder: "./uploads/menu-items" });
// Add a menu category
router.post(
  "/category",
  authenticate(["restaurant"]),
  menuController.addMenuCategory
);
// Edit Menu Category
router.put(
  "/category/:id",
  authenticate(["restaurant"]),
  menuController.editMenuCategory
);
// Delete Menu Category
router.delete(
  "/category/:id",
  authenticate(["restaurant"]),
  menuController.deleteMenuCategory
);

// Add a menu item
router.post("/item", authenticate(["restaurant"]), menuController.addMenuItem);
// Edit Menu Item
router.put(
  "/item/:id",
  authenticate(["restaurant"]),
  menuController.editMenuItem
);
// Delete Menu Item
router.delete(
  "/item/:id",
  authenticate(["restaurant"]),
  menuController.deleteMenuItem
);

// Get menu for a restaurant
router.get("/restaurant", authenticate(["restaurant"]), menuController.getMenu);

router.get(
  "/restaurant/:restaurant_id",
  authenticate(["user"]),
  menuController.getMenu
);

router.post(
  "/menu-items/:id/upload-image",
  upload.single("menu_item"),
  menuController.uploadImage
);
router.put("/update", menuController.updateDiscountPrice);
module.exports = router;
