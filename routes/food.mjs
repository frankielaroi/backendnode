import express from 'express';
import Food from '../models/food.js';

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const foods = await Food.find();
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/:foodId", async (req, res) => {
  const foodId = req.params.foodId;

  try {
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.status(200).json(food);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post("/", async (req, res) => {
  try {
    const newFood = await Food.create(req.body);
    res.status(201).json(newFood);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch("/:foodId", async (req, res) => {
  const foodId = req.params.foodId;

  try {
    const updatedFood = await Food.findByIdAndUpdate(foodId, req.body, { new: true });
    if (!updatedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.status(200).json(updatedFood);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete("/:foodId", async (req, res) => {
  const foodId = req.params.foodId;

  try {
    const deletedFood = await Food.findByIdAndDelete(foodId);
    if (!deletedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.status(200).json({ message: 'Food deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
