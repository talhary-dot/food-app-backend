const jwt = require('jsonwebtoken');
const { UserModel, RestaurantModel } = require('../models');
require('dotenv').config()
const authenticate = (roles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: 'Unauthorized: No token provided.' });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ error: 'Access forbidden: Insufficient permissions.' });
            }

            // Find and attach the authenticated user or restaurant to the request
            if (decoded.role === 'user') {
                const user = await UserModel.findByPk(decoded.id);
                if (!user) return res.status(401).json({ error: 'Unauthorized: User not found.' });

                // Exclude password field
                const { password, ...userWithoutPassword } = user.toJSON();
                req.authenticated = { role: 'user', ...userWithoutPassword };
            } else if (decoded.role === 'restaurant') {
                const restaurant = await RestaurantModel.findByPk(decoded.id);
                if (!restaurant) return res.status(401).json({ error: 'Unauthorized: Restaurant not found.' });

                // Exclude password field
                const { password, ...restaurantWithoutPassword } = restaurant.toJSON();
                req.authenticated = { role: 'restaurant', ...restaurantWithoutPassword };
            }

            next();
        } catch (err) {
            console.error('Authentication error:', err);
            res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
        }
    };
};

module.exports = authenticate;
