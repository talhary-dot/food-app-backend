const express = require('express');

const authController = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.post('/forget-password', authController.forgetPassword)
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authenticate(['user', 'restaurant']), authController.changePassword);


module.exports = router;
