
const { MongoClient } = require('mongodb');

let db;


async function connectToDatabase(uri) {

    try {
      if (!process.env.MONGODB_URI) {
  throw new Error('No MongoDB URI provided. Please set the MONGODB_URI environment variable.');
}
      const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      db = client.db(); // Specify your database name if it's different from the default
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }
  function getDB() {
    if (!db) {
      throw new Error('Database not connected');
    }
    return db;
  }
  connectToDatabase(process.env.MONGODB_URI)
  module.exports = { connectToDatabase, getDB };