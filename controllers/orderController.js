const { OrderModel, OrderItemModel, MenuItemModel, UserModel } = require('../models');
require('dotenv').config()
const stripe = require("../config/stripe");
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
        return res
          .status(404)
          .json({ error: `Menu item not found: ${item.menu_item_id}` });
      }
      const price = menuItem.price * item.quantity;
      total_price += price;
      orderItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price,
      });
    }
    // Create the Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: orderItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: `Menu Item ${item.menu_item_id}`, // Adjust this as needed
          },
          unit_amount: item.price * 100, // Stripe expects the amount in cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url:process.env.STRIPE_SUCCESS_URL, // Replace with your actual success URL
      cancel_url: process.env.STRIPE_CANCEL_URL, // Replace with your actual cancel URL
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Error placing order:", err);
    res
      .status(500)
      .json({ error: "An error occurred while placing the order." });
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
  