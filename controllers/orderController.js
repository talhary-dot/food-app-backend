const {
  OrderModel,
  OrderItemModel,
  MenuItemModel,
  UserModel,
} = require("../models");
const calculatePrice = require("../utils/calculateDiscount");
const stripe = require("../config/stripe");

require("dotenv").config();

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
      console.log(calculatePrice);
      const price = calculatePrice(
        menuItem.price,
        menuItem.discount,
        item.quantity,
        menuItem.remaining_discount_time
      );

      total_price += price;
      orderItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price,
      });
    }

    // Save the order to the database
    const order = await OrderModel.create({
      customer_id,
      restaurant_id,
      ownerAmount: total_price / 100,
      total_price,
      status: "pending", // You can use 'pending' to indicate payment is not yet completed
    });

    // Save the order items
    for (const item of orderItems) {
      await OrderItemModel.create({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
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
          unit_amount: Math.round(item.price * 100), // Stripe expects the amount in cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.STRIPE_SUCCESS_URL}`, // Pass the order ID to the success URL
      cancel_url: process.env.STRIPE_CANCEL_URL,
      metadata: {
        order_id: order.id, // Include the order ID in metadata
      },
    });

    res.status(200).json({ url: session.url, order });
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
          as: "items",
          include: {
            model: MenuItemModel,
            as: "menu_item",
            attributes: ["item_name", "price"],
          },
        },
      ],
    });

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "An error occurred while fetching orders." });
  }
};

exports.getOrderDetails = async (req, res) => {
  const { id } = req.params; // Order ID

  try {
    const order = await OrderModel.findByPk(id, {
      include: [
        {
          model: OrderItemModel,
          as: "items",
          include: {
            model: MenuItemModel,
            as: "menu_item",
            attributes: ["item_name", "price"],
          },
        },
        {
          model: UserModel,
          as: "customer",
          attributes: ["name", "email"],
        },
      ],
      attributes: [
        "id",
        "customer_id",
        "restaurant_id",
        "total_price",
        "status",
        "reason",
        "completedAt",
        "tipAmount",
        "receivedBy",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (err) {
    console.error("Error fetching order details:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the order." });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, reason, tipAmount, receivedBy } = req.body;

  try {
    const order = await OrderModel.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    order.reason = reason || null;
    order.completedAt = new Date();
    order.tipAmount = tipAmount || null;
    order.receivedBy = receivedBy || null; // Update receivedBy field

    await order.save();
    res.status(200).json({
      message: `Order status updated to ${status}`,
      status: order.status,
      tipAmount: order.tipAmount,
      completedAt: order.completedAt,
      reason: order.reason,
      receivedBy: order.receivedBy,
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    res
      .status(500)
      .json({ error: "An error occurred while updating order status." });
  }
};

// exports.updateOrderStatus = async (req, res) => {
//   const { id } = req.params;
//   const { status, reason, tipAmount } = req.body;

//   try {
//     const order = await OrderModel.findByPk(id);
//     if (!order) {
//       return res.status(404).json({ error: "Order not found" });
//     }

//     order.status = status;
//     order.reason = reason || null;
//     order.completedAt = new Date();
//     order.tipAmount = tipAmount || null;

//     await order.save();
//     res.status(200).json({
//       message: `Order status updated to ${status}`,
//       status: order.status,
//       tipAmount: order.tipAmount,
//       completedAt: order.completedAt,
//       reason: order.reason,
//     });
//   } catch (err) {
//     console.error("Error updating order status:", err);
//     res
//       .status(500)
//       .json({ error: "An error occurred while updating order status." });
//   }
// };
