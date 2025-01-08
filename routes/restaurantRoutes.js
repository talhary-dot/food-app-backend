const express = require('express');

const restaurantController = require('../controllers/restaurantController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// Authentication Routes
router.post('/signup', restaurantController.signup);
router.post('/verify-otp', restaurantController.verifyOtp);
router.post('/login', restaurantController.login);

//Profile
router.get('/profile', authenticate(['restaurant']), restaurantController.fetchRestaurantDetails);
router.get('/profile/:id', authenticate(['user']), restaurantController.fetchRestaurantDetails);


router.get('/get', authenticate(['user']), restaurantController.fetchAllRestaurants);

//Search
router.get('/search', restaurantController.searchRestaurants);

module.exports = router;
