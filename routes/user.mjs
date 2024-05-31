import express from "express";
import crypto from "crypto";
import User from "../models/user.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const router = express.Router();

// Function to check if the provided ID is a valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Middleware to validate ID parameter
const validateIdParam = (req, res, next) => {
  const id = req.params.id;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  next();
};

// Route to get a user by ID
router.get("/user/:id", validateIdParam, async (req, res, next) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: `No user found with ID: ${id}` });
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// Route to create a new user
router.post("/users", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Create a new user instance
    const newUser = new User({ firstName, lastName, email, role });

    // Hash the password and set it on the user object
    newUser.password = newUser.hashPassword(password);

    // Save the user to the database
    await newUser.save();

    // Respond with the newly created user
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// Route to delete a user by ID
router.delete("/user/:id", validateIdParam, async (req, res, next) => {
  const id = req.params.id;

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// Route to update a user by ID
router.patch("/user/:id", validateIdParam, async (req, res, next) => {
  const id = req.params.id;
  const update = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, update, { new: true });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// Route for user login
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.comparePassword(password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = user.generateAuthToken();

    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
});

// Route to handle forgot password
router.post("/forgot-password", async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_SENDER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_SENDER,
      to: email,
      subject: "Password Reset Request",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
            `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
            `http://${req.headers.host}/reset/${resetToken}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    next(error);
  }
});

// Route to handle password reset form submission
router.post("/reset/:resetToken", async (req, res, next) => {
  const resetToken = req.params.resetToken;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = user.hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
});

export default router;
