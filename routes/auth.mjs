import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import User from '../models/user.js';
import GoogleUser from '../models/googleuser.js'; // Assuming you have a separate model for Google users

dotenv.config();
const router = express.Router();

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

router.get('/auth/google', (req, res) => {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    prompt: 'consent',
  });
  res.redirect(url);
});

router.get('/auth/google/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await client.getToken({ code });
    client.setCredentials(tokens);

    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userDetails = response.data;

    const googleUser = new GoogleUser({
      googleId: userDetails.sub,
      email: userDetails.email,
      name: userDetails.name,
    });
    await googleUser.save();

    res.status(200).json({ message: 'Authentication successful' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to authenticate with Google' });
  }
});



export default router;
