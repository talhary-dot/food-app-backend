const { UserModel, OptVerificationModel, RestaurantModel, OTPModel, } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
require('dotenv').config()


exports.signup = async (req, res) => {
    const { 
        role, // Either 'user' or 'restaurant'
        name,
        email,
        phone_number, // For restaurants
        phone, // For users
        password,
        confirmPassword,
        address,
        profile_picture,
        restaurant_name,
        owner_name,
        restaurant_address,
        operating_hours,
        restaurant_type,
        menu_upload,
        payment_details,
    } = req.body;

    try {
        // Validate common inputs
        if (!role || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'Role, email, password, and confirm password are required.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }

        // Determine role-specific logic
        if (role === 'user') {
            // Check if the email already exists in UserModel
            const existingUser = await UserModel.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email is already registered as a user.' });
            }

            // Create the user
            const user = await UserModel.create({
                name,
                email,
                phone,
                password,
                address,
                profile_pic: profile_picture,
            });

            // Generate and send OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            await sendOtp(email, otp);

            await OptVerificationModel.create({
                user_id: user.id,
                otp,
                expire_at: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
            });

            res.status(201).json({ message: 'User registered successfully. Please verify your email using the OTP sent.' });
        } else if (role === 'restaurant') {
            // Check if the email already exists in RestaurantModel
            const existingRestaurant = await RestaurantModel.findOne({ where: { email } });
            if (existingRestaurant) {
                return res.status(400).json({ error: 'Email is already registered as a restaurant.' });
            }

            // Create the restaurant
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

            // Generate and send OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            await sendOtp(email, otp);

            await OTPModel.create({
                restaurant_id: restaurant.id,
                otp,
                expire_at: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
            });

            res.status(201).json({ message: 'Restaurant registered successfully. Please verify your email using the OTP sent.' });
        } else {
            return res.status(400).json({ error: 'Invalid role. Allowed values are "user" or "restaurant".' });
        }
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ error: err.message || 'An error occurred while processing your request.' });
    }
};

// Helper function to send OTP via email
const sendOtp = async (email, otp) => {
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
};

exports.login = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email/Phone, password, and role are required.' });
        }

        let user;
        if (role === 'user') {
            user = await UserModel.findOne({ where: { email: email } });
        } else if (role === 'restaurant') {
            user = await RestaurantModel.findOne({
                where: { [Op.or]: [{ email: email }, { phone_number: email }] },
            });
        } else {
            return res.status(400).json({ error: 'Invalid role specified.' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid email/phone or password.' });
        }

        if (!user.is_verified) {
            return res.status(403).json({ error: 'Please verify your email before logging in.' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid email/phone or password.' });
        }

        const token = jwt.sign(
            { id: user.id, role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE_TIME }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
};


exports.verifyOtp = async (req, res) => {
    const { email, otp, role } = req.body;

    try {
        // Validate input
        if (!email || !otp || !role) {
            return res.status(400).json({ error: 'Email, OTP, and role are required.' });
        }

        // Handle OTP verification based on the role
        if (role === 'user') {
            // Find the user by email
            const user = await UserModel.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            // Find the OTP record for the user
            const otpRecord = await OptVerificationModel.findOne({
                where: {
                    user_id: user.id,
                    otp,
                    expire_at: {
                        [Op.gt]: new Date(), // Ensure OTP is not expired
                    },
                },
            });

            if (!otpRecord) {
                return res.status(400).json({ error: 'Invalid or expired OTP.' });
            }

            // Mark the user as verified
            user.is_verified = true;
            await user.save();

            // Delete the OTP record
            await otpRecord.destroy();

            return res.status(200).json({ message: 'OTP verified successfully. Your account is now verified.' });

        } else if (role === 'restaurant') {
            // Find the restaurant by email
            const restaurant = await RestaurantModel.findOne({ where: { email } });
            if (!restaurant) {
                return res.status(404).json({ error: 'Restaurant not found.' });
            }

            // Find the OTP record for the restaurant
            const otpRecord = await OTPModel.findOne({
                where: {
                    restaurant_id: restaurant.id,
                    otp,
                    expire_at: {
                        [Op.gt]: new Date(), // Ensure OTP is not expired
                    },
                },
            });

            if (!otpRecord) {
                return res.status(400).json({ error: 'Invalid or expired OTP.' });
            }

            // Mark the restaurant as verified
            restaurant.is_verified = true;
            await restaurant.save();

            // Delete the OTP record
            await otpRecord.destroy();

            return res.status(200).json({ message: 'OTP verified successfully. Your account is now verified.' });

        } else {
            return res.status(400).json({ error: 'Invalid role. Allowed values are "user" or "restaurant".' });
        }
    } catch (err) {
        console.error('Error during OTP verification:', err);
        return res.status(500).json({ error: 'An error occurred during OTP verification.' });
    }
};

exports.forgetPassword = async (req, res) => {
    const { email, role } = req.body;

    try {
        // Validate input
        if (!email || !role) {
            return res.status(400).json({ error: 'Email and role are required.' });
        }

        // Find user or restaurant
        let account;
        if (role === 'user') {
            account = await UserModel.findOne({ where: { email } });
        } else if (role === 'restaurant') {
            account = await RestaurantModel.findOne({ where: { email } });
        } else {
            return res.status(400).json({ error: 'Invalid role. Allowed values are "user" or "restaurant".' });
        }

        if (!account) {
            return res.status(404).json({ error: 'Account not found.' });
        }

        // Generate a reset token
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        account.reset_token = resetToken;
        account.reset_token_expires = new Date(Date.now() + 10 * 60 * 1000);
        await account.save();

        // Send email with reset token
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
            subject: 'Password Reset Request',
            text: `Your password reset token is ${resetToken}. It is valid for 10 minutes.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset token sent to your email.' });
    } catch (err) {
        console.error('Error during forget password:', err);
        res.status(500).json({ error: 'An error occurred during forget password.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, role, reset_token, new_password, confirm_password } = req.body;
  
    try {
      // Validate input
      if (!email || !role || !reset_token || !new_password || !confirm_password) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
  
      if (new_password !== confirm_password) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }
  
      // Find user or restaurant by email and reset token
      let account;
      if (role === 'user') {
        account = await UserModel.findOne({
          where: { email, reset_token },
        });
      } else if (role === 'restaurant') {
        account = await RestaurantModel.findOne({
          where: { email, reset_token },
        });
      } else {
        return res.status(400).json({ error: 'Invalid role. Allowed values are "user" or "restaurant".' });
      }
  
      if (!account) {
        return res.status(404).json({ error: 'Invalid email or reset token.' });
      }
  
      // Check if reset token is expired
      if (account.reset_token_expires < new Date()) {
        return res.status(400).json({ error: 'Reset token has expired.' });
      }
  
      account.password = new_password;
  
      // Clear the reset token and expiration
      account.reset_token = null;
      account.reset_token_expires = null;
      await account.save();
  
      res.status(200).json({ message: 'Password reset successfully.' });
    } catch (err) {
      console.error('Error during password reset:', err);
      res.status(500).json({ error: 'An error occurred during password reset.' });
    }
};


  exports.changePassword = async (req, res) => {
    const { old_password, new_password, confirm_password } = req.body;

    try {
        // Validate input
        if (!old_password || !new_password || !confirm_password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }

        // Determine if it's a user or restaurant
        const authenticated = req.authenticated;

        let account;
        if (authenticated.role === 'user') {
            account = await UserModel.findByPk(authenticated.id);
        } else if (authenticated.role === 'restaurant') {
            account = await RestaurantModel.findByPk(authenticated.id);
        } else {
            return res.status(400).json({ error: 'Invalid role.' });
        }

        // Verify the old password
        const isPasswordMatch = await bcrypt.compare(old_password, account.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ error: 'Old password is incorrect.' });
        }

        account.password = new_password;
        await account.save();

        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (err) {
        console.error('Error during password change:', err);
        res.status(500).json({ error: 'An error occurred while changing password.' });
    }
};