const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class MenuCategoryModel extends Model {
    static associate(models) {
      MenuCategoryModel.belongsTo(models.RestaurantModel, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
        onDelete: 'CASCADE',
      });

      MenuCategoryModel.hasMany(models.MenuItemModel, {
        foreignKey: 'category_id',
        as: 'items',
      });
    }
  }

  MenuCategoryModel.init(
    {
      category_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'MenuCategoryModel',
      tableName: 'menu_categories',
    }
  );

  return MenuCategoryModel;
};
