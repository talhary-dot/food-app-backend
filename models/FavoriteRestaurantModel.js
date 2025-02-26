const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class FavoriteRestaurantModel extends Model {
    static associate(models) {
      // A favorite restaurant belongs to a restaurant
      FavoriteRestaurantModel.belongsTo(models.RestaurantModel, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });

      // A favorite restaurant belongs to a customer
      FavoriteRestaurantModel.belongsTo(models.UserModel, {
        foreignKey: 'customer_id',
        as: 'customer',
      });
    }
  }

  FavoriteRestaurantModel.init(
    {
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Table name of CustomerModel
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'restaurants', // Table name of RestaurantModel
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'FavoriteRestaurantModel',
      tableName: 'favorite_restaurants',
    }
  );

  return FavoriteRestaurantModel;
};
