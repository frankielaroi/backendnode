import express from 'express';
import Payment from '../models/payments.js';

const router = express.Router();

router.post("/", async (req, res) => {
  const newPayment = await Payment.create(req.body);
  res.status(201).json(newPayment);
});

router.get("/", async (req, res) => {
  const payments = await Payment.find();
  res.status(200).json(payments);
});

router.get("/:paymentId", async (req, res) => {
  const paymentId = req.params.paymentId;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }
  res.status(200).json(payment);
});

router.patch("/:paymentId", async (req, res) => {
  const paymentId = req.params.paymentId;

  const updatedPayment = await Payment.findByIdAndUpdate(paymentId, req.body, {
    new: true,
  });
  if (!updatedPayment) {
    return res.status(404).json({ message: "Payment not found" });
  }
  res.status(200).json(updatedPayment);
});

router.delete("/:paymentId", async (req, res) => {
  const paymentId = req.params.paymentId;

  const deletedPayment = await Payment.findByIdAndDelete(paymentId);
  if (!deletedPayment) {
    return res.status(404).json({ message: "Payment not found" });
  }
  res.status(200).json({ message: "Payment deleted successfully" });
});

export default router;
