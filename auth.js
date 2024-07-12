const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const User = require('./models/User');
const keys = require('./config/keys');

// Configure Google strategy
passport.use(new GoogleStrategy({
  clientID: keys.GOOGLE_CLIENT_ID,
  clientSecret: keys.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
}, async (token, tokenSecret, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, false);
  }
}));

// Configure Apple strategy (replace with actual implementation)
passport.use(new AppleStrategy({
  clientID: keys.APPLE_CLIENT_ID,
  teamID: keys.APPLE_TEAM_ID,
  keyID: keys.APPLE_KEY_ID,
  privateKeyLocation: keys.APPLE_PRIVATE_KEY_LOCATION,
  callbackURL: '/api/auth/apple/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ appleId: profile.id });
    if (!user) {
      user = new User({
        appleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, false);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
});
