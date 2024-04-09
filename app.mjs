import https from 'https';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import cors from 'cors';
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from './models/user.js';
import Payment from "./models/payments.js";
import Order from "./models/order.js"; // Adjust the path based on your file structure
import Food from "./models/food.js";
import Shop from "./models/shop.js";


// connect to MongoDB
mongoose.connect(
  "mongodb+srv://jdanq21:laroi11@cluster0.0t010eo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

const app = express();
const port = 3001;


const client = new OAuth2Client({
  clientId: '1077290995207-nsp8ootlc2cvkn2v32qfu2vgvk6r25ct.apps.googleusercontent.com',
  clientSecret: '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',
  redirectUri: 'http://localhost:3000/auth/google/callback'
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Define a Mongoose schema for the Google user
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


// centralized error handling middleware
app.use(cors())
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Function to check if the provided ID is a valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Middleware to validate ID parameter
const validateIdParam = (req, res, next) => {
  const id = req.params.id;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  next();
};

// define routes

app.get("/user/:id", validateIdParam, async (req, res, next) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: `No user found with ID: ${id}` });
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});
app.post("/users", async (req, res, next) => {
    try {
      // Create a new user instance
      const newUser = new User(req.body);
  
      // Save the user to the database
      await newUser.save();
  
      // Respond with the newly created user
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  });
  
app.delete("/user/:id", validateIdParam, async (req, res, next) => {
  const id = req.params.id;

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
});

app.patch("/user/:id", validateIdParam, async (req, res, next) => {
  const id = req.params.id;

  const update = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, update, { new: true });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});
//orders api
app.post("/orders", async (req, res) => {
    const newOrder = await Order.create(req.body);
    res.status(201).json(newOrder);
  });
  
  // Route to get all orders
  app.get("/orders", async (req, res) => {
    const orders = await Order.find();
    res.status(200).json(orders);
  });
  
  // Route to get a specific order by ID
  app.get("/orders/:orderId", async (req, res) => {
    const orderId = req.params.orderId;
  
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  });
  
  // Route to update an order by ID
  app.patch("/orders/:orderId", async (req, res) => {
    const orderId = req.params.orderId;
  
    const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, {
      new: true,
    });
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(updatedOrder);
  });
  
  // Route to delete an order by ID
  app.delete("/orders/:orderId", async (req, res) => {
    const orderId = req.params.orderId;
  
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  });
  
//food api
app.get("/foods", async (req, res) => {
    try {
      const foods = await Food.find();
      res.status(200).json(foods);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Get a specific food item by ID
  app.get("/foods/:foodId", async (req, res) => {
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
  
  // Create a new food item
  app.post("/foods", async (req, res) => {
    try {
      const newFood = await Food.create(req.body);
      res.status(201).json(newFood);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Update a food item by ID
  app.patch("/foods/:foodId", async (req, res) => {
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
  
  // Delete a food item by ID
  app.delete("/foods/:foodId", async (req, res) => {
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
  
//store api
// Route to create a new food item in a shop
app.post("/shops", async (req, res) => {
    try {
      const newShop = await Shop.create(req.body);
      res.status(201).json(newShop);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Route to get all shops
  app.get("/shops", async (req, res) => {
    try {
      const shops = await Shop.find();
      res.status(200).json(shops);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Route to get a specific shop by ID
  app.get("/shops/:shopId", async (req, res) => {
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
  
  // Route to update a shop by ID
  app.patch("/shops/:shopId", async (req, res) => {
    const shopId = req.params.shopId;
  
    try {
      const updatedShop = await Shop.findByIdAndUpdate(shopId, req.body, {
        new: true,
      });
      if (!updatedShop) {
        return res.status(404).json({ message: 'Shop not found' });
      }
      res.status(200).json(updatedShop);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Route to delete a shop by ID
  app.delete("/shops/:shopId", async (req, res) => {
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
//payment section
//initialize paymennt
app.post("/initialize-transaction", async (req, res) => {
  const { email, amount } = req.body;

  const paystackParams = {
    email,
    amount,
  };

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: "Bearer sk_test_969507c3375ac0562ae65bc47190c199689d550c",
      "Content-Type": "application/json",
    },
  };

  try {
    // Make a request to Paystack
    const paystackResponse = await new Promise((resolve, reject) => {
      const paystackReq = https
        .request(options, (paystackRes) => {
          let data = "";

          paystackRes.on("data", (chunk) => {
            data += chunk;
          });

          paystackRes.on("end", () => {
            resolve(JSON.parse(data));
          });
        })
        .on("error", (error) => {
          reject(error);
        });

      paystackReq.write(JSON.stringify(paystackParams));
      paystackReq.end();
    });

    // Save payment details to MongoDB
    const paymentData = {
      email,
      amount,
      ...paystackResponse.data,
    };

    const newPayment = await Payment.create(paymentData);

    // Send the Paystack response along with the MongoDB payment details
    res.json({
      ...paystackResponse,
      payment: newPayment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//verify transaction
app.get("/verify-transaction/:reference", async (req, res) => {
    const reference = req.params.reference;
  
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: "GET",
      headers: {
        Authorization: "Bearer sk_test_969507c3375ac0562ae65bc47190c199689d550c",
      },
    };
  
    try {
      const paystackResponse = await new Promise((resolve, reject) => {
        const paystackReq = https
          .request(options, (paystackRes) => {
            let data = "";
  
            paystackRes.on("data", (chunk) => {
              data += chunk;
            });
  
            paystackRes.on("end", () => {
              const response = JSON.parse(data);
              resolve(response);
            });
          })
          .on("error", (error) => {
            reject(error);
          });
  
        paystackReq.end();
      });
  
      // Find payment in MongoDB and append verification data
      const payment = await Payment.findOneAndUpdate(
        { reference },
        {
          status: paystackResponse.data.status,
          gateway_response: paystackResponse.data,
        },
        { new: true }
      );
  
      // Check if payment exists before accessing _doc
      if (payment !== null) {
        res.json({
          ...payment,
          verification: paystackResponse.data,
        });
      } else {
        res.status(404).json({ error: "Payment not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
app.get('/auth/google', (req, res) => {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    prompt: 'consent',
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await client.getToken({ code });
    client.setCredentials(tokens);

    // Fetch user details using the access token
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userDetails = response.data;
    console.log('User Details:', userDetails);

    // Save the user details to the Google database
    const googleUser = new GoogleUser({
      googleId: userDetails.sub,
      email: userDetails.email,
      name: userDetails.name
    });
    await googleUser.save();

    res.status(200).json({ message: 'Authentication successful' });
  } catch (error) {
    console.error('Error during Google login:', error);
    res.status(500).json({ message: 'Failed to authenticate with Google' });
  }
});

app.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const isPasswordMatch = await user.comparePassword(password);
  
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const token = user.generateAuthToken();
  
      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  });
//route to search foods
app.get("/search/food", async (req, res) => {
  try {
    const { query } = req.query;
    
    // Perform a search for food items based on the query parameter
    const foods = await Food.find({ $text: { $search: query } });

    res.status(200).json(foods);
  } catch (error) {
    console.error("Error searching for food:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to search for shops
app.get("/search/shops", async (req, res) => {
  try {
    const { query } = req.query;
    
    // Perform a search for shops based on the query parameter
    const shops = await Shop.find({ $text: { $search: query } });

    res.status(200).json(shops);
  } catch (error) {
    console.error("Error searching for shops:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
