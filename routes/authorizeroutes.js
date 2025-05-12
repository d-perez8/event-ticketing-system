//handles router logic for registering user
const express = require('express');
const router = express.Router();
const {registerUser, loginUser} = require('../controls/authorizecontroller');

// Register route
router.post('/register', registerUser);

module.exports = router;
