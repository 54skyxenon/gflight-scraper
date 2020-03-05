// db.js - Performs CRUD operations for flight data

require('dotenv').config()

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Set up default mongoose connection
const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0-78xbv.mongodb.net/Flights?retryWrites=true&w=majority`;
mongoose.connect(uri, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Get the models for representing queries and trips
const Query = require('../models/Query');
const Trip = require('../models/Trip');

// Adds the flights to our cloud MongoDB server
const addFlights = async (flights) => {
    // populate an array with trips we've gotten for our query
    let trips = []

    for (var tripIndex = 0; tripIndex < flights[0].length; tripIndex++) {
        const trip = new Trip({
            price: flights[0][tripIndex].toString(),
            duration: flights[1][tripIndex].toString(),
            no_stops: flights[2][tripIndex].toString(),
            stops: []
        });

        trip.save();
        trips.push(trip._id);        
    }

    const query = new Query({
        origin: 'HND',
        dest: 'JNB',
        depart_date: new Date().getDate(),
        return_date: new Date().getDate(),
        is_round_trip: false,
        trips: trips
    });
    query.save();
    console.log('Successfully saved to DB!');
}

exports.addFlights = addFlights;