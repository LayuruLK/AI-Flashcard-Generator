const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt = require('bcrypt');

module.exports = function () {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/users/google/callback`
    },
        async (accessToken, refreshToken, profile, done) => {
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
                        phone: 'Not provided',
                        city: 'Not provided',
                        district: 'Not provided',
                        province: 'Not provided',
                        profilePhoto: profile.photos[0].value || '',
                        isGoogleAuth: true
                    });
                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    ));
};