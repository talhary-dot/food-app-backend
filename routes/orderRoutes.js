const express = require('express');

const orderController = require('../controllers/orderController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// Place an order
router.post('/place', authenticate(['user']), orderController.placeOrder);

// Get all orders for a customer
router.get('/get', authenticate(['user']), orderController.getCustomerOrders);

// Get order details
router.get('/:id', authenticate(['user', 'restaurant']), orderController.getOrderDetails);

module.exports = router;
