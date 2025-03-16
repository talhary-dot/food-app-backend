const { UserModel, OptVerificationModel } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");

exports.signup = async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    confirmPassword,
    address,
    profile_picture,
  } = req.body;

  try {
    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    // Check if the email already exists
    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    // Create a new user
    const user = await UserModel.create({
      name,
      email,
      phone,
      password,
      address,
      profile_pic: profile_picture,
    });

    // Generate a random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Verification",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    // Store OTP in the OTPVerification table
    await OptVerificationModel.create({
      user_id: user.id,
      otp,
      expire_at: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
    });

    res.status(201).json({
      message:
        "User registered successfully. Please verify your email using the OTP sent.",
    });
  } catch (err) {
    console.error("Error during signup:", err);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Find the user by email
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check if the user is verified
    if (!user.is_verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    // Compare the password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE_TIME }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "An error occurred during login." });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ error: "Email not found. Please sign up first." });
    }

    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Upsert the OTP record in the OptVerificationModel
    await OptVerificationModel.upsert({
      user_id: user.id,
      otp,
      expire_at: new Date(Date.now() + 10 * 60 * 1000), // Valid for 10 minutes
    });

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resend OTP for Verification",
      text: `Your new OTP is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "OTP resent successfully. Please check your email." });
  } catch (err) {
    console.error("Error while resending OTP:", err);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Validate the input
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    // Find the OTP record
    const otpRecord = await OptVerificationModel.findOne({
      where: {
        otp,
        expire_at: {
          [Op.gt]: new Date(), // Ensure OTP is not expired
        },
        "$user.email$": email, // Ensure OTP belongs to the user
      },
      include: {
        model: UserModel,
        as: "user",
        attributes: ["id", "email", "is_verified"],
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    // Mark the user as verified
    const user = otpRecord.user;
    user.is_verified = true;
    await user.save();

    // Delete the used OTP
    await otpRecord.destroy();

    return res.status(200).json({ message: "OTP verified successfully." });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while verifying OTP." + err });
  }
};

exports.fetchCustomerDetails = async (req, res) => {
  try {
    const authenticated = req.authenticated;

    id = authenticated.id;
    if (authenticated.role == "restaurant" && req.params.id) {
      id = req.params.id;
    }

    const user = await UserModel.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching details" });
  }
};
