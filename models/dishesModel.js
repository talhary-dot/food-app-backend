const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class DishModel extends Model {}

  DishModel.init(
    {
      dish_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      images: {
        type: DataTypes.TEXT, // For storing image URLs
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discount: {
        type: DataTypes.INTEGER, // Percentage discount
        allowNull: true,
        defaultValue: 0,
      },
      restaurant_id: {
        type: DataTypes.INTEGER, // Keep the field but remove the relation
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "DishModel",
      tableName: "dishes",
    }
  );

  return DishModel;
};
