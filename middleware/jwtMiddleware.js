const jwt = require('jsonwebtoken');

// Create a middleware function to decode JWT tokens
const jwtMiddleware = (req, res, next) => {
    // Get the JWT token from the "Authorization" header
    // Get the JWT token from the "Authorization" header
const tokenWithBearer = req.header('Authorization');
const token = tokenWithBearer.replace('Bearer ', ''); // Remove the "Bearer " prefix


    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      // Verify and decode the JWT token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      // Attach the decoded user information to the request object
      req.user = decoded;
  
      next(); // Move to the next middleware or route handler
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
  
  module.exports = jwtMiddleware;
  