const { MongoClient } = require("mongodb");

async function searchFoods(query) {
  const uri = "your_mongodb_connection_string";
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db("your_database_name");
    const collection = database.collection("foods");

    const searchResults = await collection.aggregate([
      {
        $search: {
          index: "default", // use the default search index
          text: {
            query: query,
            path: ["name", "description"] // fields to search
          }
        }
      }
    ]).toArray();

    console.log(searchResults);
    return searchResults;
  } finally {
    await client.close();
  }
}

searchFoods("pizza").catch(console.error);
module.exports = searchFoods(query)