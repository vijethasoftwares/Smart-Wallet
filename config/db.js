
const { MongoClient } = require('mongodb');

let db;

let mduri="mongodb+srv://shubhamkunwar10:8gTaoQB29JObyYbr@metakul-cluster.yxz6tnd.mongodb.net/?retryWrites=true&w=majority"
async function connectToDatabase(uri) {
    try {
      const client = new MongoClient(mduri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      db = client.db(); // Specify your database name if it's different from the default
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }
 async function getDB() {
    const client = new MongoClient(mduri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      db = client.db(); // Specify your database name if it's different from the default
    if (!db) {
      throw new Error('Database not connected');
    }
    return db;
  }
  
  module.exports = { connectToDatabase, getDB };