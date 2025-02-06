const { DishModel } = require("../models"); // Adjust the path as needed

const dishController = {
  // Create a new dish
  createDish: async (req, res) => {
    try {
      const { restaurant_id, dish_name, images, price, discount } = req.body;

      const newDish = await DishModel.create({
        restaurant_id,
        dish_name,
        images,
        price,
        discount,
      });

      return res.status(201).json({
        success: true,
        message: "Dish created successfully",
        data: newDish,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error creating dish",
        error: error.message,
      });
    }
  },

  // Update a dish
  updateDish: async (req, res) => {
    try {
      const { id } = req.params;
      const { dish_name, images, price, discount } = req.body;

      const dish = await DishModel.findByPk(id);

      if (!dish) {
        return res.status(404).json({
          success: false,
          message: "Dish not found",
        });
      }

      await dish.update({
        dish_name,
        images,
        price,
        discount,
      });

      return res.status(200).json({
        success: true,
        message: "Dish updated successfully",
        data: dish,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error updating dish",
        error: error.message,
      });
    }
  },

  // Delete a dish
  deleteDish: async (req, res) => {
    try {
      const { id } = req.params;

      const dish = await DishModel.findByPk(id);

      if (!dish) {
        return res.status(404).json({
          success: false,
          message: "Dish not found",
        });
      }

      await dish.destroy();

      return res.status(200).json({
        success: true,
        message: "Dish deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error deleting dish",
        error: error.message,
      });
    }
  },

  // Get a single dish
  getDish: async (req, res) => {
    try {
      const { id } = req.params;

      const dish = await DishModel.findByPk(id);

      if (!dish) {
        return res.status(404).json({
          success: false,
          message: "Dish not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: dish,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching dish",
        error: error.message,
      });
    }
  },

  // Get all dishes for a restaurant
  getAllDishes: async (req, res) => {
    try {
      const { restaurant_id } = req.query; // You can also get this from req.params

      const dishes = await DishModel.findAll({
        where: { restaurant_id },
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: dishes,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching dishes",
        error: error.message,
      });
    }
  },
};

module.exports = dishController;
