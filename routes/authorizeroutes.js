//handles router logic for authorization 
const express = require('express');
const router = express.Router();
const {registerUser, loginUser} = require('../controls/authorizecontroller');

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

module.exports = router;
