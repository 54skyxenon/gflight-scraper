// db.js - Performs CRUD operations for flight data

require('dotenv').config()

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Set up default mongoose connection
const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0-78xbv.mongodb.net/Flights?retryWrites=true&w=majority`;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Get the models for representing queries and trips
const Query = require('../models/Query');
const Trip = require('../models/Trip');

// Adds the flights to our cloud MongoDB server
const addFlights = async (origin, dest, departDate, returnDate, isRoundTrip, flights) => {
    // populate an array with trips we've gotten for our query
    let trips = []

    // mongoose does not cast undefined to false, so this is necessary to get added as a field
    isRoundTrip = isRoundTrip ? true : false;

    for (var tripIndex = 0; tripIndex < flights[0].length; tripIndex++) {
        const trip = new Trip({
            price: flights[0][tripIndex].toString(),
            duration: flights[1][tripIndex].toString(),
            no_stops: flights[2][tripIndex].toString(),
            stops: [] // TODO
        });

        trip.save();
        trips.push(trip._id);        
    }

    const query = new Query({
        origin: origin,
        dest: dest,
        depart_date: departDate.toString(),
        return_date: returnDate.toString(),
        is_round_trip: isRoundTrip,
        trips: trips
    });

    query.save();
    console.log('Successfully saved to DB!');
}

exports.addFlights = addFlights;
exports.connection = db;