const { RestaurantModel, OTPModel } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

// Signup
exports.signup = async (req, res) => {
  const {
    restaurant_name,
    owner_name,
    email,
    phone_number,
    password,
    restaurant_address,
    operating_hours,
    restaurant_type,
    menu_upload,
    profile_picture,
    payment_details,
  } = req.body;

  try {
    const existingRestaurant = await RestaurantModel.findOne({ where: { email } });
    if (existingRestaurant) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const restaurant = await RestaurantModel.create({
      restaurant_name,
      owner_name,
      email,
      phone_number,
      password,
      restaurant_address,
      operating_hours,
      restaurant_type,
      menu_upload,
      profile_picture,
      payment_details,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Verification',
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    await OTPModel.create({
      restaurant_id: restaurant.id,
      otp,
      expire_at: new Date(Date.now() + 10 * 60 * 1000),
    });

    res.status(201).json({ message: 'Restaurant registered successfully. Please verify your email using the OTP sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred during signup.' });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const restaurant = await RestaurantModel.findOne({ where: { email } });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    const otpRecord = await OTPModel.findOne({
      where: {
        restaurant_id: restaurant.id,
        otp,
        expire_at: { [Op.gt]: new Date() },
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    restaurant.is_verified = true;
    await restaurant.save();

    await otpRecord.destroy();

    res.status(200).json({ message: 'OTP verified successfully. Your account is now verified.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred during OTP verification.' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const restaurant = await RestaurantModel.findOne({
      where: { [Op.or]: [{ email: email }, { phone_number: email }] },
    });

    if (!restaurant) {
      return res.status(401).json({ error: 'Invalid email/phone or password.' });
    }

    if (!restaurant.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const isPasswordMatch = await bcrypt.compare(password, restaurant.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid email/phone or password.' });
    }

    const token = jwt.sign({ id: restaurant.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE_TIME });

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
};

exports.fetchRestaurantDetails = async (req, res) => {
  try {
    const authenticated = req.authenticated;

    id = authenticated.id;
    if (authenticated.role == 'user' && req.params.id) {
      id = req.params.id
    }

    const restaurant = await RestaurantModel.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(200).json({ restaurant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching details' });
  }
};


exports.fetchAllRestaurants = async (req, res) => {
  try {
    // Fetch all restaurants from the database
    const restaurants = await RestaurantModel.findAll({
      attributes: [
        'id',
        'restaurant_name',
        'owner_name',
        'email',
        'phone_number',
        'restaurant_address',
        'operating_hours',
        'restaurant_type',
        'menu_upload',
        'profile_picture',
        'payment_details',
        'is_verified',
        'createdAt',
        'updatedAt',
      ],
    });

    res.status(200).json({ restaurants });
  } catch (err) {
    console.error('Error fetching all restaurants:', err);
    res.status(500).json({ error: 'An error occurred while fetching all restaurants.' });
  }
};


exports.searchRestaurants = async (req, res) => {
  const { name } = req.query;

  try {
    // Validate query parameter
    if (!name) {
      return res.status(400).json({ error: 'Name query parameter is required.' });
    }

    // Perform search
    const restaurants = await RestaurantModel.findAll({
      where: {
        restaurant_name: {
          [Op.like]: `%${name}%`, // Partial match for the search term
        },
      },
      attributes: ['id', 'restaurant_name', 'profile_picture', 'restaurant_address', 'restaurant_type'],
    });

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'No restaurants found matching the search term.' });
    }

    res.status(200).json({ restaurants });
  } catch (err) {
    console.error('Error searching restaurants:', err);
    res.status(500).json({ error: 'An error occurred while searching for restaurants.' });
  }
};