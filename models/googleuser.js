const mongoose = require("mongoose");


const googleUserSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  name: String,
  picture: String,
  accessToken: String,
  refreshToken: String,
  locale: String,
  expiresAt: Date,
  sub: String // The subject or unique identifier within an IdP (e.g., the user’s email address or username). If present in the ID
});

// Create a Mongoose model for the Google user
const GoogleUser = mongoose.model('GoogleUser', googleUserSchema);

module.exports = GoogleUser;