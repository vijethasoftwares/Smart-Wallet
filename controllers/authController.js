var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var jwt = require("jsonwebtoken");
var User = require("../models/User");
var SystemAdmin = require("../models/SystemAdmin");
var _a = require("ethers"), ethers = _a.ethers, Wallet = _a.Wallet, Contract = _a.Contract;
var _b = require("userop"), Presets = _b.Presets, Client = _b.Client;
var _c = require("../utils/crypto"), encrypt = _c.encrypt, decrypt = _c.decrypt, generateWallet = _c.generateWallet, getWalletBalance = _c.getWalletBalance, signTransaction = _c.signTransaction;
var _d = require("./logoutToken"), isTokenInvalid = _d.isTokenInvalid, invalidateTokens = _d.invalidateTokens, removeInvalidTokens = _d.removeInvalidTokens;
var _e = require("../utils/otp"), generateOTP = _e.generateOTP, verifyOTP = _e.verifyOTP;
var PayMasterUrl = process.env.PAYMASTER_URL || "";
var rpcUrl = process.env.RPC_URL || "";
//for logout
var bcrypt = require("bcrypt");
var authenticationController = {
    // System Admin Login and Initialization
    systemAdminInitialize: function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var existingAdmin, _a, email, password, wallet, encryptedPrivateKey, user, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, SystemAdmin.findByEmail({
                            user_type: "SYSTEM_ADMIN",
                        })];
                case 1:
                    existingAdmin = _b.sent();
                    if (existingAdmin) {
                        return [2 /*return*/, res.status(400).json({ error: "System Admin already exists" })];
                    }
                    _a = req.body, email = _a.email, password = _a.password;
                    return [4 /*yield*/, generateWallet()];
                case 2:
                    wallet = _b.sent();
                    encryptedPrivateKey = encrypt(wallet.privateKey, password);
                    user = new SystemAdmin({
                        email: email,
                        password: password,
                        walletAddress: wallet.address,
                        encryptedPrivateKey: encryptedPrivateKey,
                        user_type: "SYSTEM_ADMIN",
                    });
                    return [4 /*yield*/, user.save()];
                case 3:
                    _b.sent();
                    res.status(201).json({
                        message: "System Admin registered and initialized successfully",
                    });
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _b.sent();
                    console.error(err_1);
                    res.status(500).json({ error: "Initialization failed" });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); },
    registerUser: function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, email, password, phoneNumber, user_country, existingUser, emailRegex, wallet, encryptedPrivateKey, signer, paymasterContext, paymasterMiddleware, builder, address, user, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    _a = req.body, email = _a.email, password = _a.password, phoneNumber = _a.phoneNumber, user_country = _a.user_country;
                    return [4 /*yield*/, User.findByEmail(email)];
                case 1:
                    existingUser = _b.sent();
                    if (existingUser) {
                        return [2 /*return*/, res.status(400).json({ error: "User Already Exists." })];
                    }
                    emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        return [2 /*return*/, res.status(400).json({ error: "Invalid email format." })];
                    }
                    // Validate the password length
                    if (password.length < 5) {
                        return [2 /*return*/, res
                                .status(400)
                                .json({ error: "Password must be at least 5 characters long." })];
                    }
                    return [4 /*yield*/, generateWallet()];
                case 2:
                    wallet = _b.sent();
                    encryptedPrivateKey = encrypt(wallet.privateKey, password);
                    signer = new ethers.Wallet(wallet.privateKey);
                    paymasterContext = { type: "payg" };
                    paymasterMiddleware = Presets.Middleware.verifyingPaymaster(PayMasterUrl, paymasterContext);
                    return [4 /*yield*/, Presets.Builder.Kernel.init(signer, rpcUrl, {
                            paymasterMiddleware: paymasterMiddleware,
                        })];
                case 3:
                    builder = _b.sent();
                    address = builder.getSender();
                    console.log("Account address: ".concat(address));
                    user = new User({
                        email: email,
                        password: password,
                        walletAddress: wallet.address,
                        smartWalletAddress: address,
                        encryptedPrivateKey: encryptedPrivateKey,
                        user_type: "METAKUL_USER",
                        user_country: user_country,
                        emailPending: false,
                    });
                    return [4 /*yield*/, user.save()];
                case 4:
                    _b.sent();
                    res.status(201).json({ message: "User registered successfully" });
                    return [3 /*break*/, 6];
                case 5:
                    err_2 = _b.sent();
                    console.error(err_2);
                    res.status(500).json({ error: "Registration failed" });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); },
    // Login with email and password, and return both access and refresh tokens
    userLogin: function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, email, password, user, isPasswordValid, balance, access, refresh, token, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    _a = req.body, email = _a.email, password = _a.password;
                    return [4 /*yield*/, User.findByEmail(email)];
                case 1:
                    user = _b.sent();
                    if (!user) {
                        return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                    }
                    return [4 /*yield*/, bcrypt.compare(password, user.password)];
                case 2:
                    isPasswordValid = _b.sent();
                    if (!isPasswordValid) {
                        return [2 /*return*/, res.status(401).json({ error: "Invalid password" })];
                    }
                    // Check if user_type is "METAKUL_USER"
                    if (user.user_type !== "METAKUL_USER") {
                        return [2 /*return*/, res
                                .status(403)
                                .json({ error: "Do not have enough Permission " })];
                    }
                    return [4 /*yield*/, getWalletBalance(user.walletAddress)];
                case 3:
                    balance = _b.sent();
                    access = jwt.sign({
                        sub: user._id,
                        email: user.email,
                        smartWalletAddress: user.smartWalletAddress,
                        walletAddress: user.walletAddress,
                        user_type: user.user_type,
                        walletBalance: balance,
                    }, process.env.SECRET_KEY, { expiresIn: "10h" });
                    refresh = jwt.sign({
                        sub: user._id,
                        email: user.email,
                        smartWalletAddress: user.smartWalletAddress,
                        walletAddress: user.walletAddress,
                        user_type: user.user_type,
                        walletBalance: balance,
                    }, process.env.SECRET_KEY, { expiresIn: "1d" });
                    token = {
                        access: access,
                        refresh: refresh,
                    };
                    // Send both tokens in the response
                    res.json({ message: "Login successful", token: token });
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _b.sent();
                    console.error(err_3);
                    res.status(500).json({ error: "Login failed" });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); },
    // System Admin Login
    systemAdminLogin: function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, email, password, systemAdmin, isPasswordValid, balance, access, refresh, token, err_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    _a = req.body, email = _a.email, password = _a.password;
                    return [4 /*yield*/, SystemAdmin.findByEmail(email)];
                case 1:
                    systemAdmin = _b.sent();
                    if (!systemAdmin) {
                        return [2 /*return*/, res.status(404).json({ error: "SystemAdmin not found" })];
                    }
                    return [4 /*yield*/, bcrypt.compare(password, systemAdmin.password)];
                case 2:
                    isPasswordValid = _b.sent();
                    if (!isPasswordValid) {
                        return [2 /*return*/, res.status(401).json({ error: "Invalid password" })];
                    }
                    // Check if user_type is "systemadmin"
                    if (systemAdmin.user_type !== "SYSTEM_ADMIN") {
                        return [2 /*return*/, res
                                .status(403)
                                .json({ error: "Do not have enough Permission " })];
                    }
                    return [4 /*yield*/, getWalletBalance(systemAdmin.walletAddress)];
                case 3:
                    balance = _b.sent();
                    access = jwt.sign({
                        sub: systemAdmin._id,
                        email: systemAdmin.email,
                        walletAddress: systemAdmin.walletAddress,
                        user_type: systemAdmin.user_type,
                        university: systemAdmin.university,
                        walletBalance: balance,
                    }, process.env.SECRET_KEY, { expiresIn: "1h" } // Set the access token expiration to 20 seconds
                    );
                    refresh = jwt.sign({
                        sub: systemAdmin._id,
                        email: systemAdmin.email,
                        walletAddress: systemAdmin.walletAddress,
                        user_type: systemAdmin.user_type,
                        university: systemAdmin.university,
                        walletBalance: balance,
                    }, process.env.SECRET_KEY, { expiresIn: "1d" } // Set the refresh token expiration to 1 day
                    );
                    token = {
                        access: access,
                        refresh: refresh,
                    };
                    // Send both tokens in the response
                    res.json({
                        data: {
                            token: token,
                        },
                    });
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _b.sent();
                    console.error(err_4);
                    res.status(500).json({ error: "System Admin login failed" });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); },
    // Middleware to verify the refresh token and generate a new access token
    refreshAccessTokenMiddleware: function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var refresh_1, verifyToken, decodedToken, access, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    refresh_1 = req.body.refresh;
                    if (!refresh_1) {
                        return [2 /*return*/, res.status(401).json({ error: "Refresh token is missing" })];
                    }
                    verifyToken = function () {
                        return new Promise(function (resolve, reject) {
                            jwt.verify(refresh_1, process.env.SECRET_KEY, function (err, decoded) {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve(decoded);
                                }
                            });
                        });
                    };
                    return [4 /*yield*/, verifyToken()];
                case 1:
                    decodedToken = _a.sent();
                    console.log(decodedToken);
                    access = jwt.sign({
                        sub: decodedToken.sub,
                        email: decodedToken.email,
                        walletAddress: decodedToken.walletAddress,
                        smartWalletAddress: decodedToken.smartWalletAddress,
                        user_type: decodedToken.user_type,
                        walletBalance: decodedToken.walletBalance,
                        university: decodedToken.university,
                    }, process.env.SECRET_KEY, { expiresIn: "1h" });
                    // Send the new access token in the response
                    res.json({ access: access });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error refreshing access token:", error_1);
                    res.status(403).json({ error: "Invalid refresh token" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    // Sign a transaction using the user's password and private key
    signTransaction: function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, password, encodedParams, nonce, email, bearerToken, token, decoded, user, privateKey, signedTransaction, err_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    _a = req.body, password = _a.password, encodedParams = _a.encodedParams, nonce = _a.nonce;
                    email = req.user.email;
                    bearerToken = req.headers.authorization;
                    console.log(bearerToken);
                    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
                        return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                    }
                    token = bearerToken.split(" ")[1];
                    decoded = jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
                        if (err) {
                            return res.status(401).json({ error: "Unauthorized" });
                        }
                        else {
                            return decoded;
                        }
                    });
                    user = void 0;
                    console.log(password, encodedParams, nonce);
                    if (!(decoded.user_type == "METAKUL_USER")) return [3 /*break*/, 2];
                    return [4 /*yield*/, User.findByEmail(email)];
                case 1:
                    user = _b.sent();
                    return [3 /*break*/, 5];
                case 2:
                    if (!(decoded.user_type == "SYSTEM_ADMIN")) return [3 /*break*/, 4];
                    return [4 /*yield*/, SystemAdmin.findByEmail(email)];
                case 3:
                    user = _b.sent();
                    return [3 /*break*/, 5];
                case 4: return [2 /*return*/, res.status(404).json({
                        error: "You dont have enough permission to sign Transaction.",
                    })];
                case 5:
                    privateKey = decrypt(user.encryptedPrivateKey, password);
                    return [4 /*yield*/, signTransaction(encodedParams, nonce, privateKey)];
                case 6:
                    signedTransaction = _b.sent();
                    res.json({
                        message: "Transaction signed successfully",
                        signedTransaction: signedTransaction,
                    });
                    return [3 /*break*/, 8];
                case 7:
                    err_5 = _b.sent();
                    console.error(err_5);
                    res.status(500).json({ error: "Transaction signing failed" });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); },
    userOpsBuilder: function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, contract, getUserOp, password, email, bearerToken, token, decoded, user, privateKey, signer, paymasterContext, paymasterMiddleware, builder, address, client, response, ev, err_6;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 10, , 11]);
                    _a = req.body, contract = _a.contract, getUserOp = _a.getUserOp, password = _a.password;
                    console.log("userop:", getUserOp);
                    email = req.user.email;
                    bearerToken = req.headers.authorization;
                    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
                        return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                    }
                    token = bearerToken.split(" ")[1];
                    decoded = jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
                        if (err) {
                            return res.status(401).json({ error: "Unauthorized" });
                        }
                        else {
                            return decoded;
                        }
                    });
                    user = void 0;
                    if (!(decoded.user_type == "METAKUL_USER")) return [3 /*break*/, 2];
                    return [4 /*yield*/, User.findByEmail(email)];
                case 1:
                    user = _c.sent();
                    return [3 /*break*/, 5];
                case 2:
                    if (!(decoded.user_type == "SYSTEM_ADMIN")) return [3 /*break*/, 4];
                    return [4 /*yield*/, SystemAdmin.findByEmail(email)];
                case 3:
                    user = _c.sent();
                    return [3 /*break*/, 5];
                case 4: return [2 /*return*/, res.status(404).json({
                        error: "You dont have enough permission to sign Transaction.",
                    })];
                case 5:
                    privateKey = decrypt(user.encryptedPrivateKey, password);
                    signer = new ethers.Wallet(privateKey);
                    paymasterContext = { type: "payg" };
                    paymasterMiddleware = Presets.Middleware.verifyingPaymaster(PayMasterUrl, paymasterContext);
                    return [4 /*yield*/, Presets.Builder.Kernel.init(signer, rpcUrl, {
                            paymasterMiddleware: paymasterMiddleware,
                        })];
                case 6:
                    builder = _c.sent();
                    address = builder.getSender();
                    console.log("Account address: ".concat(address));
                    //it should console the getUserOp according to contract
                    console.log(builder.getOp());
                    return [4 /*yield*/, Client.init(rpcUrl)];
                case 7:
                    client = _c.sent();
                    return [4 /*yield*/, client.sendUserOperation(builder.executeBatch(getUserOp), {
                            onBuild: function (op) { return console.log("Signed UserOperation:", op); },
                        })];
                case 8:
                    response = _c.sent();
                    console.log("myresponse", response);
                    console.log("Waiting for transaction...");
                    return [4 /*yield*/, response.wait()];
                case 9:
                    ev = _c.sent();
                    console.log(ev);
                    console.log("Transaction hash: ".concat((_b = ev === null || ev === void 0 ? void 0 : ev.transactionHash) !== null && _b !== void 0 ? _b : null));
                    res.json({
                        message: "User Operation Built and Mined SuccessFully",
                        data: ev,
                    });
                    return [3 /*break*/, 11];
                case 10:
                    err_6 = _c.sent();
                    console.log(err_6);
                    res.status(500).json({ error: "Failed Building User Ops " });
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    }); },
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
    getUserWalletAndBalance: function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var email, user, walletAddress, balance, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(req.user);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    email = req.user.email;
                    return [4 /*yield*/, User.findByEmail(email)];
                case 2:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                    }
                    walletAddress = user.walletAddress;
                    return [4 /*yield*/, getWalletBalance(walletAddress)];
                case 3:
                    balance = _a.sent();
                    res.json({ walletAddress: walletAddress, balance: balance });
                    return [3 /*break*/, 5];
                case 4:
                    err_7 = _a.sent();
                    console.error(err_7);
                    console.log(req.user);
                    res.status(500).json({ error: "Failed to get user wallet and balance" });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); },
    getASystemAdminWalletAndBalance: function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var email, user, walletAddress, balance, err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(req.user);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    email = req.user.email;
                    return [4 /*yield*/, SystemAdmin.findByEmail(email)];
                case 2:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                    }
                    walletAddress = user.walletAddress;
                    return [4 /*yield*/, getWalletBalance(walletAddress)];
                case 3:
                    balance = _a.sent();
                    res.json({ walletAddress: walletAddress, balance: balance });
                    return [3 /*break*/, 5];
                case 4:
                    err_8 = _a.sent();
                    console.error(err_8);
                    console.log(req.user);
                    res.status(500).json({ error: "Failed to get user wallet and balance" });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); },
    // User Profile Route
    getProfile: function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var email, user, userType, walletAddress, user_country, emailPending, err_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    email = req.user.email;
                    return [4 /*yield*/, User.findByEmail(email)];
                case 1:
                    user = _a.sent();
                    userType = user.userType, walletAddress = user.walletAddress, user_country = user.user_country, emailPending = user.emailPending;
                    res.json({
                        user: {
                            email: email,
                            user_country: user_country,
                            userType: userType,
                            walletAddress: walletAddress,
                            emailPending: emailPending,
                        },
                    });
                    return [3 /*break*/, 3];
                case 2:
                    err_9 = _a.sent();
                    console.error(err_9);
                    res.status(500).json({ error: "Failed to get user profile" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    // User Logout
    userLogout: function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var bearerToken, token;
        return __generator(this, function (_a) {
            try {
                bearerToken = req.headers.authorization;
                if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
                    return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                }
                token = bearerToken.split(" ")[1];
                // Check if the token is in the list of invalidated tokens
                if (isTokenInvalid(token)) {
                    return [2 /*return*/, res.status(401).json({ error: "Token is already invalidated" })];
                }
                // Invalidate the token by setting its expiry time to an earlier time (e.g., 1 second ago)
                // You can also add it to a list of invalidated tokens if needed
                // Set the access and refresh tokens to empty strings or any other value to indicate invalidation
                // For example, you can set them to 'invalid' or 'expired' to help identify invalidated tokens
                invalidateTokens(token);
                // Respond with a logout message
                res.json({ message: "Logout successful" });
            }
            catch (err) {
                console.error(err);
                res.status(500).json({ error: "Logout failed" });
            }
            return [2 /*return*/];
        });
    }); },
    // SystemAdmin Logout
    systemAdminLogout: function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var bearerToken, token;
        return __generator(this, function (_a) {
            try {
                bearerToken = req.headers.authorization;
                if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
                    return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                }
                token = bearerToken.split(" ")[1];
                // Invalidate the token by setting its expiry time to an earlier time (e.g., 1 second ago)
                // You can also add it to a list of invalidated tokens if needed
                // Respond with a logout message
                res.json({ message: "University logout successful" });
            }
            catch (err) {
                console.error(err);
                res.status(500).json({ error: "University logout failed" });
            }
            return [2 /*return*/];
        });
    }); },
};
module.exports = authenticationController;
