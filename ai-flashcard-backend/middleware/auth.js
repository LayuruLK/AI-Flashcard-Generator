const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {User} = require('../models/User');

// JWT configuration
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

// JWT strategy
passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const user = await User.findById(jwtPayload.sub);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (!user) {
      user = new User({
        firstName: profile.name.givenName || 'Google',
        lastName: profile.name.familyName || 'User',
        email: profile.emails[0].value,
        passwordHash: bcrypt.hashSync(Math.random().toString(36).slice(-8), 10),
        nic: 'GOOGLE_' + Math.random().toString(36).slice(2, 10),
        gender: 'other',
        phone: '',
        city: '',
        district: '',
        province: '',
        profilePhoto: profile.photos[0].value || ''
      });
      await user.save();
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Middleware to protect routes
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    req.user = user; // Attach the full user object
    next();
  })(req, res, next);
};

module.exports = {
  passport,
  generateToken,
  authenticate
};