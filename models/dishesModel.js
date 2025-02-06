const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class DishModel extends Model {
    static associate(models) {
     
      DishModel.belongsTo(models.RestaurantModel, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
    }
  }

  DishModel.init(
    {
      dish_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      images: {
        type: DataTypes.TEXT, // For storing imagse URLs
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
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "restaurants",
          key: "id",
        },
        onDelete: "CASCADE",
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
