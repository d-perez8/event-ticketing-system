const User = require('../models/user.js');
const jwt = require('jsonwebtoken'); //All authenticated routes must require a valid JWT token in the header.
const bcrypt = require('bcrypt'); //Uses bcrypt for password hashing, .env for secrets

//creates a jsonwebtoken for a user based on their id and role
const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
};

//registers user
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    //check for existing user email(somoen with same name could sign up with different email)
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    //create and save new user
    const user = new User({ name, email, password, role: role || 'user' });
    await user.save();

    //calls creatToken on user to store in body for future use, and print out user registration info
    const token = createToken(user);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {registerUser};
