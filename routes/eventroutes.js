//handle routing logic for events
const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAdminDashboard
} = require('../controls/eventcontroller.js');

const authmidware = require('../middleware/authorizemidware');
const adminmidware = require('../middleware/authorizemidware');

//toute to get all events
router.get('/', getEvents);

//route for event by id
router.get('/:id', getEventById);

//route for admin to create an event
router.post('/', authmidware, adminmidware, createEvent);

//route for admin to update event by id
router.put('/:id', authmidware, adminmidware, updateEvent);

//route for admin to delete event by id
router.delete('/:id', authmidware, adminmidware, deleteEvent);

//route for admin to see bookings on dashboard
router.get('/admin/dashboard', adminmidware, getAdminDashboard);

module.exports = router;