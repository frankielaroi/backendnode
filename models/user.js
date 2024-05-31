const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "seller", "admin"],
    default: "user",
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\S+@\S+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// Method to hash the password
userSchema.methods.hashPassword = function (password) {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Method to compare passwords
userSchema.methods.comparePassword = function (candidatePassword) {
  const hashedPassword = crypto.createHash('sha256').update(candidatePassword).digest('hex');
  return hashedPassword === this.password;
};

// Token generation method
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const User = mongoose.model("User", userSchema);
module.exports = User;