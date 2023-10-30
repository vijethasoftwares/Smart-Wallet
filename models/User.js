const { getDB } = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  constructor({
    email,
    password,
    walletAddress,
    encryptedPrivateKey,
    user_type,
    user_country,
    emailPending,
  }) {
    this.email = email;
    this.password = password;
    this.walletAddress = walletAddress;
    this.encryptedPrivateKey = encryptedPrivateKey;
    this.user_type = user_type;
    this.user_country=user_country,
    this.emailPending = emailPending || false; // Default to true  (Change this to validate users by)
  }

  async save() {
    const db = getDB();
    const userCollection = db.collection('users');

    // Check if the email is already registered
    const existingUser = await userCollection.findOne({ email: this.email });
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    // Hash the user's password before storing it in the database
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;

    // Insert the user document into the 'users' collection
    const result = await userCollection.insertOne(this);
    return result;
  }

  static async findByEmail(email) {
    const db = getDB();
    const userCollection = db.collection('users');
    return userCollection.findOne({ email });
  }
}

module.exports = User;