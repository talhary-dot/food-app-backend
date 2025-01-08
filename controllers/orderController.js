const { OrderModel, OrderItemModel, MenuItemModel, UserModel } = require('../models');

exports.placeOrder = async (req, res) => {
  const { restaurant_id, items } = req.body; // items: [{ menu_item_id, quantity }]
  const customer_id = req.authenticated.id; // From the authentication middleware

  try {
    // Calculate the total price
    let total_price = 0;
    const orderItems = [];
    for (const item of items) {
      const menuItem = await MenuItemModel.findByPk(item.menu_item_id);
      if (!menuItem) {
        return res.status(404).json({ error: `Menu item not found: ${item.menu_item_id}` });
      }
      const price = menuItem.price * item.quantity;
      total_price += price;

      orderItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price,
      });
    }


    //99% of the order amount goes to the restaurant's account and 1% is retained as app charges
    // Calculate app charges and restaurant earnings
    // const app_charges = (total_price * 1) / 100; // 1%
    // const restaurant_earnings = total_price - app_charges; // 99%

    // Create the order
    const order = await OrderModel.create({
      customer_id,
      restaurant_id,
      total_price,
    });

    // Add items to the order
    for (const orderItem of orderItems) {
      await OrderItemModel.create({
        ...orderItem,
        order_id: order.id,
      });
    }

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'An error occurred while placing the order.' });
  }
};

exports.getCustomerOrders = async (req, res) => {
    const customer_id = req.authenticated.id; // From the authentication middleware
  
    try {
      const orders = await OrderModel.findAll({
        where: { customer_id },
        include: [
          {
            model: OrderItemModel,
            as: 'items',
            include: {
              model: MenuItemModel,
              as: 'menu_item',
              attributes: ['item_name', 'price'],
            },
          },
        ],
      });
  
      res.status(200).json({ orders });
    } catch (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ error: 'An error occurred while fetching orders.' });
    }
  };

  exports.getOrderDetails = async (req, res) => {
    const { id } = req.params; // Order ID
  
    try {
      const order = await OrderModel.findByPk(id, {
        include: [
          {
            model: OrderItemModel,
            as: 'items',
            include: {
              model: MenuItemModel,
              as: 'menu_item',
              attributes: ['item_name', 'price'],
            },
          },
          {
            model: UserModel,
            as: 'customer',
            attributes: ['name', 'email'],
          },
        ],
      });
  
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      res.status(200).json({ order });
    } catch (err) {
      console.error('Error fetching order details:', err);
      res.status(500).json({ error: 'An error occurred while fetching the order.' });
    }
  };
  