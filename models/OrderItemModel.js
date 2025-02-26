const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class OrderItemModel extends Model {
    static associate(models) {
      OrderItemModel.belongsTo(models.OrderModel, {
        foreignKey: 'order_id',
        as: 'order',
      });

      OrderItemModel.belongsTo(models.MenuItemModel, {
        foreignKey: 'menu_item_id',
        as: 'menu_item',
      });
    }
  }

  OrderItemModel.init(
    {
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
      },
      menu_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'menu_items',
          key: 'id',
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'OrderItemModel',
      tableName: 'order_items',
    }
  );

  return OrderItemModel;
};
