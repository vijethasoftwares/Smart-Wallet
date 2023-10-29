const express = require('express');
const authController = require('../controllers/authController'); // Require the controller
const router = express.Router();

// Import middleware modules
const jwtMiddleware = require('../middleware/jwtMiddleware');

// Registration route
router.post('/setSystemAdmin', authController.systemAdminInitialize);
router.post('/systemAdmin/login', authController.systemAdminLogin);

// Login route
router.post('/user/registerUser', authController.registerUser);
router.post('/user/login', authController.userLogin);

//refresh Token 
router.post('/token/refresh', authController.refreshAccessTokenMiddleware);

// Route to sign trx with trxData and password
router.post('/signTransaction', jwtMiddleware, authController.signTransaction);
router.post('/userOpsBuilder', jwtMiddleware, authController.userOpsBuilder);

// Route to get user wallet and balance with JWT middleware applied
router.get('/user/getWalletAndBalance', jwtMiddleware, authController.getUserWalletAndBalance);
router.get('/systemAdmin/getWalletAndBalance', jwtMiddleware, authController.getASystemAdminWalletAndBalance);
router.get('/getProfile', jwtMiddleware, authController.getProfile);

// Logout route
router.post('/user/logout', authController.userLogout);
router.post('/systemAdmin/logout', authController.systemAdminLogout);


module.exports = router;
