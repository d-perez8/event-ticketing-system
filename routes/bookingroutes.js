//handles routing logic for bookings
const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getBookingById, validateBooking } = require('../controls/bookingcontroller.js');
const authorize = require('../middleware/authorizemidware.js'); // Ensure the user is logged in

//routes to create booking, get all bookings for user, and specific booking info
router.post('/', authorize, createBooking);
router.get('/', authorize, getUserBookings);
router.get('/:id', authorize, getBookingById);
router.get('/validate/:qr', validateBooking);

module.exports = router;
