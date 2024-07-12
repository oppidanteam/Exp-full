const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: String,
  appleId: String,
  displayName: String,
  email: String,
});

module.exports = mongoose.model('User', UserSchema);
