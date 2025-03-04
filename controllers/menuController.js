const { MenuCategoryModel, MenuItemModel } = require("../models");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "menuItemPictures");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

exports.addMenuCategory = async (req, res) => {
  const { category_name } = req.body;

  restaurant_id = req.authenticated.id;
  try {
    const category = await MenuCategoryModel.create({
      restaurant_id,
      category_name,
    });
    res.status(201).json({ message: "Category added successfully", category });
  } catch (err) {
    console.error("Error adding menu category:", err);
    res
      .status(500)
      .json({ error: "An error occurred while adding the category." });
  }
};

exports.editMenuCategory = async (req, res) => {
  const { id } = req.params;
  const { category_name } = req.body;

  try {
    // Find the category by ID
    const category = await MenuCategoryModel.findByPk(id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Update the category
    category.category_name = category_name;
    await category.save();

    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (err) {
    console.error("Error updating category:", err);
    res
      .status(500)
      .json({ error: "An error occurred while updating the category." });
  }
};

exports.deleteMenuCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the category by ID
    const category = await MenuCategoryModel.findByPk(id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Delete the category
    await category.destroy();

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the category." });
  }
};

exports.addMenuItem = async (req, res) => {
  const { category_id, item_name, price, description } = req.body;

  try {
    const item = await MenuItemModel.create({
      category_id,
      item_name,
      price,
      description,
    });
    res.status(201).json({ message: "Menu item added successfully", item });
  } catch (err) {
    console.error("Error adding menu item:", err);
    res
      .status(500)
      .json({ error: "An error occurred while adding the menu item." });
  }
};

exports.uploadImage = async (req, res) => {
  const { id } = req.params;
  upload.single("image")(req, res, async (err) => {
    if (err) {
      console.error("Error uploading image:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while uploading the image." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }
    try {
      const item = await MenuItemModel.findByPk(id);
      if (!item) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      item.image_path = req.file.path;
      await item.save();
      res.status(200).json({ message: "Image uploaded successfully", item });
    } catch (err) {
      console.error("Error updating menu item with image:", err);
      res.status(500).json({
        error: "An error occurred while updating the menu item with image.",
      });
    }
  });
};

exports.editMenuItem = async (req, res) => {
  const { id } = req.params;
  const { item_name, price, description } = req.body;

  try {
    const item = await MenuItemModel.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    item.item_name = item_name;
    item.price = price;
    item.description = description;
    await item.save();

    res.status(200).json({ message: "Menu item updated successfully", item });
  } catch (err) {
    console.error("Error updating menu item:", err);
    res
      .status(500)
      .json({ error: "An error occurred while updating the menu item." });
  }
};

exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await MenuItemModel.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    await item.destroy();
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (err) {
    console.error("Error deleting menu item:", err);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the menu item." });
  }
};

exports.getMenu = async (req, res) => {
  let restaurant_id = req.authenticated.id;

  if (req.authenticated.role === "user" && req.params) {
    restaurant_id = req.params.restaurant_id;
  }
  try {
    const categories = await MenuCategoryModel.findAll({
      where: { restaurant_id },
      include: [
        {
          model: MenuItemModel,
          as: "items",
        },
      ],
    });
    const menu = categories.map((category) => ({
      ...category.toJSON(),
      items: category.items.map((item) => ({
        ...item.toJSON(),
        image_url: item.image_path
          ? `${req.protocol}://${req.get(
              "host"
            )}/menuItemPictures/${path.basename(item.image_path)}`
          : null,
      })),
    }));

    res.status(200).json({ menu });
  } catch (err) {
    console.error("Error fetching menu:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the menu." });
  }
};
