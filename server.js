const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//load environment variables
dotenv.config();

//create Express app
const app = express();

//middleware to parse JSON
app.use(express.json());

//import all routes
const eventRoutes = require('./routes/eventroutes.js');
const authorizeRoutes = require('./routes/authorizeroutes.js');
const bookingRoutes = require('./routes/bookingroutes.js');


//to use the routes
app.use('/api/events', eventRoutes);
app.use('/api/auth', authorizeRoutes);
app.use('/api/bookings', bookingRoutes);


//test route
app.get('/', (req, res) => {
  res.send('Welcome to the Event Ticketing System API');
});

//MongoDB connection and server start
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
