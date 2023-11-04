
const { MongoClient } = require('mongodb');

let db;


async function connectToDatabase(uri) {
  
    try {
      console.log(uri)
      const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      db = client.db(); // Specify your database name if it's different from the default
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }
  function getDB() {
    console.log(db)
    if (!db) {
      throw new Error('Database not connected');
    }
    return db;
  }
  
  module.exports = { connectToDatabase, getDB };
