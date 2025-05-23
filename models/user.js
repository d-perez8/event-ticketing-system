const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //to hash password

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true]
  },
  email: {
    type: String,
    required: [true],
    unique: true
  },
  password: {
    type: String,
    required: [true]
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user' //if user role isn't specified defaults to user
  }
});

//hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
