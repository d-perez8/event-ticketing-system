const Booking = require('../models/bookingmodel.js');
const Event = require('../models/eventmodels.js');

//create booking
const createBooking = async (req, res) => {
    //store eventid, quantity(capcity), and user id for creating a booking for an event
    const {eventId, quantity} = req.body;
    const userId = req.user.id;
  
    try {
    //find the event
        const event = await Event.findById(eventId);
        if (!event) {
        return res.status(404).json({message: 'Event not found'});
    }

    //check if venue capacity is filled
    if (event.seatCapacity - event.bookedSeats < quantity) {
      return res.status(400).json({message: 'Not enough seats available'});
    }

    //create booking
    const booking = new Booking({
      user: userId,
      event: eventId,
      quantity
    });

    await booking.save();

    //update venues bookedSeats
    event.bookedSeats += quantity;
    await event.save();
    //return success message with body to show that booking was successful to venue
    res.status(201).json({
      message: 'Booking successful',
      booking: {
        id: booking._id,
        user: booking.user,
        event: booking.event,
        quantity: booking.quantity,
        bookingDate: booking.bookingDate,
      },
      event: {
        id: event._id,
        title: event.title,
        bookedSeats: event.bookedSeats,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all bookings for specific user
const getUserBookings = async (req, res) => {
    const userId = req.user.id;
    try {
        const bookings = await Booking.find({user: userId}).populate('event', 'title date venue price'); //finds bookings by userId
        res.status(200).json({ bookings });
    } 
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//find bookings by booking id and user id
const getBookingById = async (req, res) => {
    const userId = req.user.id;
    const bookingId = req.params.id;

    try {
    //finds spcific booking to event by both user id and booking id
        const booking = await Booking.findOne({ _id: bookingId, user: userId }).populate('event', 'title date venue price');
        if (!booking) {
        return res.status(404).json({ message: 'Booking not found or access denied' });
        }
        res.status(200).json({ booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = { 
    createBooking,
    getUserBookings,
    getBookingById
 };
