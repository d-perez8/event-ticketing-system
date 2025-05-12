const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//booking schema
const bookingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', //valid user check
        required: true,
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event', //valid event check
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    bookingDate: {
        type: Date,
        default: Date.now, //sets booking from this instance
    }
});

//create and export booking model
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
