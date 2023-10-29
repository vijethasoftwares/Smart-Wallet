const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();
const rateLimiter = require('./middleware/rateLimiter'); // Require rate limiting middleware
const { connectToDatabase } = require('./config/db'); // Import the database connection function



const app = express();
const port = process.env.PORT || 8003;

app.use(bodyParser.json());
const corsOptions = {
  origin: '*', // Allow requests from all origins
};


app.use(cors(corsOptions)); // Use the cors middleware with the specified options


// Connect to MongoDB
connectToDatabase();


// Initialize Passport middleware
app.use(passport.initialize());

// Apply rate limiting middleware globally or as needed
app.use('/auth/sendotp', rateLimiter);
// Apply rate limiting middleware to specific routes
// app.use('/auth/user/login', rateLimiter);

// Use the authentication routes
app.use('/auth', require('./routes/auth'));

// Other routes can be added as needed

app.listen(port, () => {
  console.log(`Backend Server is running on port ${port}`);
});

export default app