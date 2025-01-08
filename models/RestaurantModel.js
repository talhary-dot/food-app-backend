const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  class RestaurantModel extends Model {
    static associate(models) {
      // A restaurant can have many favorite relationships
      RestaurantModel.hasMany(models.FavoriteRestaurantModel, {
        foreignKey: 'restaurant_id',
        as: 'favorites',
      });
    }
  }

  RestaurantModel.init(
    {
      restaurant_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      owner_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      restaurant_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      operating_hours: {
        type: DataTypes.STRING,
      },
      restaurant_type: {
        type: DataTypes.STRING,
      },
      menu_upload: {
        type: DataTypes.TEXT,
      },
      profile_picture: {
        type: DataTypes.TEXT,
      },
      payment_details: {
        type: DataTypes.STRING,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reset_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reset_token_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'RestaurantModel',
      tableName: 'restaurants',
      hooks: {
        beforeCreate: async (restaurant) => {
          if (restaurant.password) {
            const salt = await bcrypt.genSalt(10);
            restaurant.password = await bcrypt.hash(restaurant.password, salt);
          }
        },
        beforeUpdate: async (restaurant) => {
          if (restaurant.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            restaurant.password = await bcrypt.hash(restaurant.password, salt);
          }
        },
      },
    }
  );

  return RestaurantModel;
};
