const express = require('express');

const favoriteController = require('../controllers/favouriteController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// Add a favorite restaurant
router.post('/add', authenticate(['user']), favoriteController.addFavoriteRestaurant);

// Remove a favorite restaurant
router.post('/remove', authenticate(['user']), favoriteController.removeFavoriteRestaurant);

// Get all favorite restaurants for a customer
router.get('/get', authenticate(['user']), favoriteController.getFavoriteRestaurants);

module.exports = router;
