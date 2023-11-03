const { getDB } = require('../config/db');
const bcrypt = require('bcrypt');

class SystemAdmin {
  constructor({
    
    email,
    password,
    walletAddress,
    encryptedPrivateKey,
    phoneNumber,
    user_type,
  }) {
    
    this.email = email;
    this.password = password;
    this.walletAddress = walletAddress;
    this.encryptedPrivateKey = encryptedPrivateKey;
    this.phoneNumber = phoneNumber;
    this.user_type = user_type;
  }

  async save() {
    const db = getDB();
    const systemAdminCollection = db.collection('SYSTEM_ADMIN');

    // Check if the email is already registered
    const existingSystemAdmin = await systemAdminCollection.findOne({ email: this.email });
    if (existingSystemAdmin) {
      throw new Error('Email is already registered');
    }

    // Hash the systemAdmin's password before storing it in the database
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;

    // Insert the systemAdmin document into the 'systemAdmins' collection
    const result = await systemAdminCollection.insertOne(this);
    return result;
  }



  static async findByEmail(email) {
    const db = getDB();
    const systemAdminCollection = db.collection('SYSTEM_ADMIN');
    return systemAdminCollection.findOne({ email });
  }
}

module.exports = SystemAdmin;
