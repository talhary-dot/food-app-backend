const stripe = require('../config/stripe'); // Your Stripe configuration
const { OrderModel } = require('../models'); // Your database models

exports.verifyOrder = async (req, res) => {
  const { session_id  } = req.query; // Stripe session ID sent from the client

  console.log(session_id)
  try {
    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);


    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if the payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Find the order in the database using the session's metadata
    const order_id = session.metadata.order_id; // Assuming you passed `order_id` in metadata
    const order = await OrderModel.findByPk(order_id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update the order status to 'paid'
    order.status = 'paid';
    await order.save();
    res.redirect(`${process.env.FRONTEND_URL}/order-success?order_id=${order.id}`);
  } catch (err) {
    console.error('Error verifying order:', err);
    res.redirect(`${process.env.FRONTEND_URL}/order-failed`)
    res.status(500).json({ error: 'An error occurred while verifying the order.' });
  }
};
