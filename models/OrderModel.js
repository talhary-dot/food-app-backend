const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class OrderModel extends Model {
    static associate(models) {
      OrderModel.belongsTo(models.UserModel, {
        foreignKey: "customer_id",
        as: "customer",
      });

      OrderModel.hasMany(models.OrderItemModel, {
        foreignKey: "order_id",
        as: "items",
      });
    }
  }

  OrderModel.init(
    {
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "restaurants",
          key: "id",
        },
      },
      total_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Pending", // Pending, Accepted, Rejected, Delivered
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      tipAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      receivedBy: {
        type: DataTypes.STRING,
        allowNull: true, // Optional field
      },
    },
    {
      sequelize,
      modelName: "OrderModel",
      tableName: "orders",
    }
  );

  return OrderModel;
};
