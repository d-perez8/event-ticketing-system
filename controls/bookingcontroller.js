const Booking = require('../models/bookingmodel.js');
const Event = require('../models/eventmodels.js');
const qrCode = require('qrcode');
const nodemailer = require('nodemailer');
const User = require('../models/user.js');

const emailConfirm = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

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
    
    const qrData = `booking:${booking._id}`;
    const qrImg = await qrCode.toDataURL(qrData);
    booking.qrCode = qrImg;
    await booking.save();

    const user = await User.findById(userId);
    const userEmail = user.email;

    const sendConfirm = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Booking Confirmation',
      html: `
        <h2>Booking Confirmed for: ${event.title}</h2>
        <p>Quantity: ${quantity}</p>
        <p>Date: ${event.date.toDateString()}</p>
        <p>Venue: ${event.venue}</p>
        <p>Here is your QR code for entry:</p>
        <img src ="${qrImg}" alt="QR Code"/>
        `
    };

    emailConfirm.sendMail(sendConfirm, (error, info) => {
      if (error) {
        console.error('Error sending wmail:', error);
      }
      else{
        console.log('Email sent: ' + info.response);
      }
    });

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
        qrCode: booking.qrCode
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

const validateBooking = async (req, res) => {
  try{
    const qr = req.params.qr;

    const booking = await Booking.findOne({qrCode: qr}).populate('user', 'name email').populate('event', 'title date venue');

    if (!booking) {
      return res.status(404).json({message: 'Invalid or expired'})
    }

    res.status(200).json({
      message: 'Ticket is vaild',
      booking: {
        id: booking._id,
        user: booking.user,
        event: booking.event,
        quantity: booking.quantity,
        bookingDate: booking.bookiingDate,
      }
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

module.exports = { 
    createBooking,
    getUserBookings,
    getBookingById,
    validateBooking,
    emailConfirm
 };
