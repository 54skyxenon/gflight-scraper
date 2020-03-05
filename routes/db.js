// db.js - Performs CRUD operations for flight data

require('dotenv').config()
const mongoose = require('mongoose');

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

    for (var tripIndex = 0; tripIndex < flights[0].length; tripIndex++) {
        flights[3][tripIndex].forEach((stop, index) => {
            flights[3][tripIndex][index] = JSON.parse(flights[3][tripIndex][index])
        });

        const trip = new Trip({
            price: flights[0][tripIndex].toString().replace(/\s.*/, ''),
            duration: flights[1][tripIndex].toString(),
            no_stops: flights[2][tripIndex].toString(),
            stops: flights[3][tripIndex]
        });

        await trip.save();
        trips.push(trip._id);
    }

    // TODO: make sure there's only ONE entry for a given origin/dest/depart/arrival combination

    /**
     * const queryResult = await db.connection.db
        .collection('queries')
        .find({
            'origin': origin,
            'dest': dest,
            'depart_date': departDate,
            'return_date': returnDate,
            'is_round_trip': isRoundTrip
        })
        .toArray();

    // Do a new scrape if it's over a day or hasn't been done yet
    if (queryResult.length == 0) {
        return true;
    } else {
        return ((new Date().getTime() - Date.parse(queryResult[0].updatedAt)) > 86400000);
    }
     */

    const query = new Query({
        origin: origin,
        dest: dest,
        depart_date: departDate.toString(),
        return_date: returnDate.toString(),
        is_round_trip: isRoundTrip,
        trips: trips
    });

    await query.save();
    console.log('Successfully saved to DB!');
}

// Returns the query containing the trips
const getQuery = async (origin, dest, departDate, returnDate, isRoundTrip) => {
    return await db.db
        .collection('queries')
        .find({
            'origin': origin,
            'dest': dest,
            'depart_date': departDate,
            'return_date': returnDate,
            'is_round_trip': isRoundTrip
        })
        .toArray();
}

// Returns the trips associated with a query
const getTrips = async (origin, dest, departDate, returnDate, isRoundTrip) => {
    const queryData = await getQuery(origin, dest, departDate, returnDate, isRoundTrip);

    return await db.db
        .collection('trips')
        .find({
            '_id': { '$in': queryData[0].trips }
        })
        .toArray();
}

exports.addFlights = addFlights;
exports.getQuery = getQuery;
exports.getTrips = getTrips;