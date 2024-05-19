import express from 'express';
import Order from '../models/order.js';

const router = express.Router();

router.post("/", async (req, res) => {
  const newOrder = await Order.create(req.body);
  res.status(201).json(newOrder);
});

router.get("/", async (req, res) => {
  const orders = await Order.find();
  res.status(200).json(orders);
});

router.get("/:orderId", async (req, res) => {
  const orderId = req.params.orderId;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.status(200).json(order);
});

router.patch("/:orderId", async (req, res) => {
  const orderId = req.params.orderId;

  const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, {
    new: true,
  });
  if (!updatedOrder) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.status(200).json(updatedOrder);
});

router.delete("/:orderId", async (req, res) => {
  const orderId = req.params.orderId;

  const deletedOrder = await Order.findByIdAndDelete(orderId);
  if (!deletedOrder) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.status(200).json({ message: "Order deleted successfully" });
});

export default router;
