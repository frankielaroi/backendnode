import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.mjs";
import foodRoutes from "./routes/food.mjs";
import orderRoutes from "./routes/order.mjs";
import paymentRoutes from "./routes/payment.mjs";
import searchRoutes from "./routes/search.mjs";
import shopRoutes from "./routes/shop.mjs";
import UserRoutes from "./routes/user.mjs";

dotenv.config();

const app = express();
const port = 7000;

app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use(authRoutes);
app.use("/foods", foodRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);
app.use("/search", searchRoutes);
app.use("/shops", shopRoutes);
app.use(UserRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
