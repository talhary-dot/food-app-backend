const { Model, DataTypes } = require("sequelize");
const path = require("path");

module.exports = (sequelize) => {
  class MenuItemModel extends Model {
    static associate(models) {
      MenuItemModel.belongsTo(models.MenuCategoryModel, {
        foreignKey: "category_id",
        as: "category",
        onDelete: "CASCADE",
      });
    }
  }

  MenuItemModel.init(
    {
      item_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      discount: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
          max: 100,
        },
      },
      remaining_discount_time: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isFuture(value) {
            if (value && new Date(value) <= new Date()) {
              throw new Error(
                "remaining_discount_time must be a future date and time."
              );
            }
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "menu_categories",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      image_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "MenuItemModel",
      tableName: "menu_items",
    }
  );

  return MenuItemModel;
};
