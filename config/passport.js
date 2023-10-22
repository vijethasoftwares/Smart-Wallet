const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/User');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email', // Field name for email in the request body
      passwordField: 'password', // Field name for password in the request body
    },
    async (email, password, done) => {
      try {
        // Find the user by email
        const user = await User.findOne({ email });

        // If no user found, return an error
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        // If the passwords match, return the user
        if (isMatch) {
          return done(null, user);
        } else {
          // If the passwords don't match, return an error
          return done(null, false, { message: 'Incorrect password' });
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

module.exports = passport;
