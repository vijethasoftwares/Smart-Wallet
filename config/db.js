
const { MongoClient } = require('mongodb');

let db;

const myUri=process.env.MONGODB_URI
async function connectToDatabase(uri) {

    try {
      if (!myUri) {
  throw new Error('No MongoDB URI provided. Please set the MONGODB_URI environment variable.');
}
      const client = new MongoClient(myUri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      db = client.db(); // Specify your database name if it's different from the default
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }
 async function getDB() {
    const client = new MongoClient(myUri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      db = client.db(); // Specify your database name if it's different from the default
    if (!db) {
      throw new Error('Database not connected');
    }
    return db;
  }
  module.exports = { connectToDatabase, getDB };