const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SystemAdmin = require("../models/SystemAdmin");
const { ethers, Wallet, Contract } = require("ethers");
const { Presets, Client } = require("userop");
const {
  encrypt,
  decrypt,
  generateWallet,
  getWalletBalance,
  signTransaction,
} = require("../utils/crypto");
const {
  isTokenInvalid,
  invalidateTokens,
  removeInvalidTokens,
} = require("./logoutToken");
const { generateOTP, verifyOTP } = require("../utils/otp");
const PayMasterUrl = process.env.PAYMASTER_URL || "";
const rpcUrl = process.env.RPC_URL || "";

//for logout

const bcrypt = require("bcrypt");

const authenticationController = {
  // System Admin Login and Initialization

  hosting: async (req, res) => {

      res.status(200).json({ msg: "Initialization Success" });
  },
  systemAdminInitialize: async (req, res) => {
    try {
      // Check if the System Admin already exists
      const existingAdmin = await SystemAdmin.findByEmail({
        user_type: "SYSTEM_ADMIN",
      });

      if (existingAdmin) {
        return res.status(400).json({ error: "System Admin already exists" });
      }

      // Create a new System Admin
      const { email, password } = req.body;

      // Generate a new Ethereum wallet for the System Admin
      const wallet = await generateWallet();

      // Encrypt the private key before saving it
      const encryptedPrivateKey = encrypt(wallet.privateKey, password);

      const user = new SystemAdmin({
        email,
        password,
        walletAddress: wallet.address,
        encryptedPrivateKey,
        user_type: "SYSTEM_ADMIN",
      });

      await user.save();

      res.status(201).json({
        message: "System Admin registered and initialized successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Initialization failed" });
    }
  },

  registerUser: async (req, res) => {
    try {
      const { email, password, phoneNumber, user_country } = req.body;

      // Check if the email is already registered
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User Already Exists." });
      }

      // Validate the email format using a regular expression
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }

      // Validate the password length
      if (password.length < 5) {
        return res
          .status(400)
          .json({ error: "Password must be at least 5 characters long." });
      }

      // Continue with registration if all checks pass

      // Generate a new Ethereum wallet using Web3.js
      const wallet = await generateWallet();

      // Encrypt the private key before saving it
      const encryptedPrivateKey = encrypt(wallet.privateKey, password);

      const signer = new ethers.Wallet(wallet.privateKey);

      const paymasterContext = { type: "payg" };
      const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
        PayMasterUrl,
        paymasterContext
      );
      // Initialize the Builder
      var builder = await Presets.Builder.Kernel.init(signer, rpcUrl, {
        paymasterMiddleware: paymasterMiddleware,
      });
        
      const address = builder.getSender();
      console.log(`Account address: ${address}`);

      // Create a new user with the email, hashed password, wallet details, and user type
      const user = new User({
        email,
        password: password,
        walletAddress: wallet.address,
        smartWalletAddress:address,
        encryptedPrivateKey,
        user_type: "METAKUL_USER",
        user_country,
        emailPending: false,
      });

      await user.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Registration failed" });
    }
  },

  // Login with email and password, and return both access and refresh tokens
  userLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // Check if user_type is "METAKUL_USER"
      if (user.user_type !== "METAKUL_USER") {
        return res
          .status(403)
          .json({ error: "Do not have enough Permission " });
      }

      const balance = await getWalletBalance(user.walletAddress);

      // Generate JWT token for authentication
      const access = jwt.sign(
        {
          sub: user._id,
          email: user.email,
          smartWalletAddress:user.smartWalletAddress,
          walletAddress: user.walletAddress,
          user_type: user.user_type,
          walletBalance: balance,
        },
        process.env.SECRET_KEY,
        { expiresIn: "10h" }
      );

      // Generate a refresh token with a longer expiration time
      const refresh = jwt.sign(
        {
          sub: user._id,
          email: user.email,
          smartWalletAddress:user.smartWalletAddress,
          walletAddress: user.walletAddress,
          user_type: user.user_type,
          walletBalance: balance,
        },
        process.env.SECRET_KEY,
        { expiresIn: "1d" }
      );

      const token = {
        access,
        refresh,
      };

      // Send both tokens in the response
      res.json({ message: "Login successful", token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Login failed" });
    }
  },

  // System Admin Login
  systemAdminLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      const systemAdmin = await SystemAdmin.findByEmail(email);
      if (!systemAdmin) {
        return res.status(404).json({ error: "SystemAdmin not found" });
      }

      // Verify the password
      const isPasswordValid = await bcrypt.compare(
        password,
        systemAdmin.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // Check if user_type is "systemadmin"
      if (systemAdmin.user_type !== "SYSTEM_ADMIN") {
        return res
          .status(403)
          .json({ error: "Do not have enough Permission " });
      }
      const balance = await getWalletBalance(systemAdmin.walletAddress);

      // University login is valid, generate JWT token for authentication
      const access = jwt.sign(
        {
          sub: systemAdmin._id,
          email: systemAdmin.email,
          walletAddress: systemAdmin.walletAddress,
          user_type: systemAdmin.user_type,
          university: systemAdmin.university,
          walletBalance: balance,
        },
        process.env.SECRET_KEY,
        { expiresIn: "1h" } // Set the access token expiration to 20 seconds
      );

      // Generate a refresh token with a longer expiration time
      const refresh = jwt.sign(
        {
          sub: systemAdmin._id,
          email: systemAdmin.email,
          walletAddress: systemAdmin.walletAddress,
          user_type: systemAdmin.user_type,
          university: systemAdmin.university,
          walletBalance: balance,
        },
        process.env.SECRET_KEY,
        { expiresIn: "1d" } // Set the refresh token expiration to 1 day
      );

      const token = {
        access,
        refresh,
      };

      // Send both tokens in the response
      res.json({
        data: {
          token,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "System Admin login failed" });
    }
  },

  // Middleware to verify the refresh token and generate a new access token
  refreshAccessTokenMiddleware: async (req, res) => {
    try {
      const { refresh } = req.body;

      if (!refresh) {
        return res.status(401).json({ error: "Refresh token is missing" });
      }

      // Verify the refresh token asynchronously using a promise
      const verifyToken = () =>
        new Promise((resolve, reject) => {
          jwt.verify(refresh, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
              reject(err);
            } else {
              resolve(decoded);
            }
          });
        });

      // Verify the refresh token
      const decodedToken = await verifyToken();
      console.log(decodedToken);

      // Generate a new access token with the same user data
      const access = jwt.sign(
        {
          sub: decodedToken.sub,
          email: decodedToken.email,
          walletAddress: decodedToken.walletAddress,
          smartWalletAddress:decodedToken.smartWalletAddress,
          user_type: decodedToken.user_type,
          walletBalance: decodedToken.walletBalance,
          university: decodedToken.university,
        },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );

      // Send the new access token in the response
      res.json({ access });
    } catch (error) {
      console.error("Error refreshing access token:", error);
      res.status(403).json({ error: "Invalid refresh token" });
    }
  },

  // Sign a transaction using the user's password and private key
  signTransaction: async (req, res) => {
    try {
      const { password, encodedParams, nonce } = req.body;

      // Verify the JWT token and retrieve the user's ID
      const { email } = req.user; // Use req.user instead of localStorage

      const bearerToken = req.headers.authorization;

      console.log(bearerToken);

      if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Extract the JWT token (remove 'Bearer ' from the token string)
      const token = bearerToken.split(" ")[1];

      // Verify and decode the JWT token
      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY,
        (err, decoded) => {
          if (err) {
            return res.status(401).json({ error: "Unauthorized" });
          } else {
            return decoded;
          }
        }
      );

      let user;
      console.log(password, encodedParams, nonce);

      if (decoded.user_type == "METAKUL_USER") {
        user = await User.findByEmail(email);
      }  else if (decoded.user_type == "SYSTEM_ADMIN") {
        user = await SystemAdmin.findByEmail(email);
      } else {
        return res.status(404).json({
          error: "You dont have enough permission to sign Transaction.",
        });
      }

      // Decrypt the user's private key using the password
      const privateKey = decrypt(user.encryptedPrivateKey, password);

      // Sign the transaction using the decrypted private key
      const signedTransaction = await signTransaction(
        encodedParams,
        nonce,
        privateKey
      );

      res.json({
        message: "Transaction signed successfully",
        signedTransaction,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Transaction signing failed" });
    }
  },

  userOpsBuilder: async (req, res) => {
    try {
      const { contract, getUserOp, password } = req.body;
      console.log("userop:", getUserOp,password);

      // Verify the JWT token and retrieve the user's ID
      const { email } = req.user; // Use req.user instead of localStorage

      const bearerToken = req.headers.authorization;

      if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Extract the JWT token (remove 'Bearer ' from the token string)
      const token = bearerToken.split(" ")[1];

      // Verify and decode the JWT token
      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY,
        (err, decoded) => {
          if (err) {
            return res.status(401).json({ error: "Unauthorized" });
          } else {
            return decoded;
          }
        }
      );

      let user;

      if (decoded.user_type == "METAKUL_USER") {
        user = await User.findByEmail(email);
      } else if (decoded.user_type == "SYSTEM_ADMIN") {
        user = await SystemAdmin.findByEmail(email);
      } else {
        return res.status(404).json({
          error: "You dont have enough permission to sign Transaction.",
        });
      }

      // Decrypt the user's private key using the password
      const privateKey = decrypt(user.encryptedPrivateKey, password);

      const signer = new ethers.Wallet(privateKey);
      console.log("prvt key",privateKey)

      const paymasterContext = { type: "payg" };
      const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
        PayMasterUrl,
        paymasterContext
      );
      // Initialize the Builder
      var builder = await Presets.Builder.Kernel.init(signer, rpcUrl, {
        paymasterMiddleware: paymasterMiddleware,
      });
        
      const address = builder.getSender();
      console.log(`Account address: ${address}`);
      //it should console the getUserOp according to contract
      console.log(builder.getOp());

      //send UserOp to erc4337 wallet
      const client = await Client.init(rpcUrl);

      const response = await client.sendUserOperation(
        builder.executeBatch(getUserOp),
        {
          onBuild: (op) => console.log("Signed UserOperation:", op),
        }
      );
      console.log("myresponse", response);

      console.log("Waiting for transaction...");
      const ev = await response.wait();
      console.log(ev);
      console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);

      res.json({
        message: "User Operation Built and Mined SuccessFully",
        data: ev,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  },
  // userOpsBuilderWithCustomERC20: async (req, res) => {
  //   try {
  //     const { getUserOp, password } = req.body;
  //     console.log(getUserOp)

  //     // Verify the JWT token and retrieve the user's ID
  //     const { email } = req.user; // Use req.user instead of localStorage

  //     const bearerToken = req.headers.authorization;

  //     if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
  //       return res.status(401).json({ error: "Unauthorized" });
  //     }

  //     // Extract the JWT token (remove 'Bearer ' from the token string)
  //     const token = bearerToken.split(" ")[1];

  //     // Verify and decode the JWT token
  //     const decoded = jwt.verify(
  //       token,
  //       process.env.SECRET_KEY,
  //       (err, decoded) => {
  //         if (err) {
  //           return res.status(401).json({ error: "Unauthorized" });
  //         } else {
  //           return decoded;
  //         }
  //       }
  //     );

  //     let user;

  //     if (decoded.user_type == "METAKUL_USER") {
  //       user = await User.findByEmail(email);
  //     } else if (decoded.user_type == "SYSTEM_ADMIN") {
  //       user = await SystemAdmin.findByEmail(email);
  //     } else {
  //       return res
  //         .status(404)
  //         .json({
  //           error: "You dont have enough permission to sign Transaction.",
  //         });
  //     }

  //     // Decrypt the user's private key using the password
  //     const privateKey = decrypt(user.encryptedPrivateKey, password);

  //     console.log(privateKey);

  //     const signer = new ethers.Wallet(privateKey);

  //     // get payment in other erc20 token
  //     const paymasterMiddleware=Presets.Middleware.verifyingPaymaster(PayMasterUrl,{
  //       type:"erc20",
  //       token:"" // any token address I want to get payment in
  //     })

  //     var builder = await Presets.Builder.Kernel.init(signer, rpcUrl, {
  //       paymasterMiddleware: paymasterMiddleware,
  //     });

  //     console.log(builder.getSender());

  //     builder.executeBatch(getUserOp);

  //     //it should console the getUserOp according to contract
  //     console.log(`UserOpHash: ${builder.getOp()}`);

  //     //send UserOp to erc4337 wallet
  //     const client = await Client.init(rpcUrl);
  //     const response = await client.sendUserOperation(
  //       builder.executeBatch(getUserOp),
  //       {
  //         onBuild: (op) => console.log("Signed UserOperation:", op),
  //       }
  //     );

  //     console.log("Waiting for transaction...");
  //     const ev = await response.wait();
  //     console.log(ev)
  //     console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);

  //     res.json({
  //       message: "User Operation Built and Mined SuccessFully",
  //       data: ev,
  //     });
  //   } catch (err) {
  //     res.status(500).json({ error: "Failed Building User Ops " });
  //   }
  // },

  getUserWalletAndBalance: async (req, res) => {
    console.log(req.user);
    try {
      const { email } = req.user; // Retrieve user's email from the authenticated JWT
      // Find the user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get the user's wallet address from the user document
      const walletAddress = user.walletAddress;

      // Get the balance of the user's wallet
      const balance = await getWalletBalance(walletAddress);

      res.json({ walletAddress, balance });
    } catch (err) {
      console.error(err);
      console.log(req.user);

      res.status(500).json({ error: "Failed to get user wallet and balance" });
    }
  },

  getASystemAdminWalletAndBalance: async (req, res) => {
    console.log(req.user);
    try {
      const { email } = req.user; // Retrieve user's email from the authenticated JWT
      // Find the user by email
      const user = await SystemAdmin.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get the user's wallet address from the user document
      const walletAddress = user.walletAddress;

      // Get the balance of the user's wallet
      const balance = await getWalletBalance(walletAddress);

      res.json({ walletAddress, balance });
    } catch (err) {
      console.error(err);
      console.log(req.user);

      res.status(500).json({ error: "Failed to get user wallet and balance" });
    }
  },
  // User Profile Route
  getProfile: async (req, res) => {
    try {
      const { email } = req.user; // Get the user's email from the JWT

      // Find the user by email
      const user = await User.findByEmail(email);

      // Assuming user has a userType and walletAddress property
      const { userType, walletAddress, user_country, emailPending } = user;

      res.json({
        user: {
          email,
          user_country,
          userType,
          walletAddress,
          emailPending,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get user profile" });
    }
  },

  // User Logout
  userLogout: async (req, res) => {
    try {
      const bearerToken = req.headers.authorization;

      if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Extract the JWT token (remove 'Bearer ' from the token string)
      const token = bearerToken.split(" ")[1];

      // Check if the token is in the list of invalidated tokens
      if (isTokenInvalid(token)) {
        return res.status(401).json({ error: "Token is already invalidated" });
      }

      // Invalidate the token by setting its expiry time to an earlier time (e.g., 1 second ago)
      // You can also add it to a list of invalidated tokens if needed
      // Set the access and refresh tokens to empty strings or any other value to indicate invalidation
      // For example, you can set them to 'invalid' or 'expired' to help identify invalidated tokens
      invalidateTokens(token);

      // Respond with a logout message
      res.json({ message: "Logout successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Logout failed" });
    }
  },

  // SystemAdmin Logout
  systemAdminLogout: async (req, res) => {
    try {
      // Assuming the client sends the token in the request headers
      const bearerToken = req.headers.authorization;

      if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Extract the JWT token (remove 'Bearer ' from the token string)
      const token = bearerToken.split(" ")[1];

      // Invalidate the token by setting its expiry time to an earlier time (e.g., 1 second ago)
      // You can also add it to a list of invalidated tokens if needed

      // Respond with a logout message
      res.json({ message: "University logout successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "University logout failed" });
    }
  },
};

module.exports = authenticationController;
