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
    enum: ["breakfast", "lunch", "dinner", "dessert", "others"],
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

// Create a compound text index on the 'name', 'description', and 'category' fields
foodSchema.index({ name: "text", description: "text", category: "text" });

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;
