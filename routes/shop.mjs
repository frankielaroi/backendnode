import express from 'express';
import Shop from '../models/shop.js';

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const shops = await Shop.find();
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/:shopId", async (req, res) => {
  const shopId = req.params.shopId;

  try {
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.status(200).json(shop);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post("/", async (req, res) => {
  try {
    const newShop = await Shop.create(req.body);
    res.status(201).json(newShop);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch("/:shopId", async (req, res) => {
  const shopId = req.params.shopId;

  try {
    const updatedShop = await Shop.findByIdAndUpdate(shopId, req.body, { new: true });
    if (!updatedShop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.status(200).json(updatedShop);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete("/:shopId", async (req, res) => {
  const shopId = req.params.shopId;

  try {
    const deletedShop = await Shop.findByIdAndDelete(shopId);
    if (!deletedShop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.status(200).json({ message: 'Shop deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
