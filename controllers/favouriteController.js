const { FavoriteRestaurantModel, RestaurantModel } = require('../models');

// Add a Favorite Restaurant
exports.addFavoriteRestaurant = async (req, res) => {
  const { restaurant_id } = req.body;

  customer_id = req.authenticated.id;
  try {
    const existingFavorite = await FavoriteRestaurantModel.findOne({
      where: { customer_id, restaurant_id },
    });

    if (existingFavorite) {
      return res.status(400).json({ error: 'Restaurant is already in your favorites.' });
    }

    const favorite = await FavoriteRestaurantModel.create({ customer_id, restaurant_id });

    res.status(201).json({ message: 'Restaurant added to favorites.', favorite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while adding the restaurant to favorites.' });
  }
};

// Remove a Favorite Restaurant
exports.removeFavoriteRestaurant = async (req, res) => {
  const { restaurant_id } = req.body;

  customer_id = req.authenticated.id;
  try {
    const favorite = await FavoriteRestaurantModel.findOne({
      where: { customer_id, restaurant_id },
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Restaurant is not in your favorites.' });
    }

    await favorite.destroy();

    res.status(200).json({ message: 'Restaurant removed from favorites.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while removing the restaurant from favorites.' });
  }
};


exports.getFavoriteRestaurants = async (req, res) => {
  customer_id = req.authenticated.id;

  try {
    const favorites = await FavoriteRestaurantModel.findAll({
      where: { customer_id },
      include: [
        {
          model: RestaurantModel,
          as: 'restaurant',
          attributes: ['id', 'restaurant_name', 'profile_picture'],
        },
      ],
    });

    res.status(200).json({ favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching favorite restaurants.' + err });
  }
};

