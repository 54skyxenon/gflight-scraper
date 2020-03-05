// Trip.js - represents the information for a complete trip

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Trip = new Schema({
    price: String,
    duration: String,
    no_stops: String,
    stops: [{
        origin: String,
        dest: String,
        airline: String,
        flightNumber: String,
        departureTime: String,
        arrivalTime: String,
        duration: String
    }]
});

module.exports = mongoose.model('Trip', Trip);