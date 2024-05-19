import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const mongodbUri = process.env.MONGODB_URI; // Use your MongoDB URI

const client = new MongoClient(mongodbUri, {});

let isConnected = false;

async function connectToMongoDB() {
  try {
    await client.connect();
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

async function searchFoods(query) {
  const database = client.db("test"); // Use your database name
  const collection = database.collection("foods");

  const searchResults = await collection
    .aggregate([
      {
        $search: {
          index: "default", // Replace with your actual index name
          text: {
            query: query,
            path: ["name", "description"], // Fields to search
          },
        },
      },
    ])
    .toArray();

  return searchResults;
}

router.get("/", async (req, res) => {
  const { query } = req.query;

  try {
    // Check if MongoDB client is connected
    if (!isConnected) {
      await connectToMongoDB();
    }

    const results = await searchFoods(query);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error searching for food:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
