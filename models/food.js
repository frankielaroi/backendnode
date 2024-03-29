// food.js

const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop", 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;
