const Event = require('../models/eventmodels.js');
const Booking = require('../models/bookingmodel.js');

//getEvent with filtering options
const getEvents = async (req, res) => {
  try {
    const { category, date } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (date) {
      //convert date to start and end dates
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      filter.date = { $gte: startDate, $lt: endDate };
    }

    const events = await Event.find(filter);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//finds event by event id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//create event only if user is admin
const createEvent = async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const {
      title,
      description,
      category,
      venue,
      date,
      time,
      seatCapacity,
      price
    } = req.body;

    const event = new Event({
      title,
      description,
      category,
      venue,
      date,
      time,
      seatCapacity,
      price
    });

    const savedEvent = await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event: savedEvent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//to update an event only if user is admin
const updateEvent = async (req, res) => {
  const {id} = req.params;
  const updates = req.body;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Prevent changing seatCapacity below current bookedSeats
    if (updates.seatCapacity !== undefined && updates.seatCapacity < event.bookedSeats) {
      return res.status(400).json({ message: 'seatCapacity cannot be less than bookedSeats' });
    }

    // Prevent updating _id
    if (updates._id) {
      delete updates._id;
    }

    Object.assign(event, updates);
    const updatedEvent = await event.save();

    res.status(200).json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//to delete event only if user is admin
const deleteEvent = async (req, res) => {
  const eventId = req.params.id;

  try {
    //first check if boookings exist to prevent deletion
    const existingBookings = await Booking.find({event: eventId});
    //if booking exists the id will be a length bigger than 0
    if (existingBookings.length > 0) {
      return res.status(409).json({ message: 'Cannot delete event with existing bookings.' });
    }
    //delete if no bookings are logged
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//to access admindashboard from events route
const getAdminDashboard = async (req, res) =>{
  try{
    const events = await Event.find();

    //frustratin gto do it in an order of operations, promise.all will do them all at once,
    //wait for all to finsih, and then proceed with the output
    const listBookers = await Promise.all(
      events.map(async (event) => {
        const bookings = await Booking.find({event: event._id}).populate('user', 'name email');

        return {
          eventId: event._id,
          title: event.title,
          date: event.date,
          venue: event.venue,
          users: bookings.map((booking) => ({
            userId: booking.user._id,
            name: booking.user.name,
            email: booking.user.email,
            quantity: booking.quantity
          }))
        };
      })
    );

    res.status(200).json(listBookers);
  } catch (err) {
    res.status(500).json({message: 'Server Error', error: err.message});
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAdminDashboard
};
