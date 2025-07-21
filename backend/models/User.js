const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  keywords: [{
    keyword: String,
    reply: String
  }],
  connected: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
