// db.js - Performs CRUD operations for flight data

require('dotenv').config()

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Set up default mongoose connection
const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0-78xbv.mongodb.net/test?retryWrites=true&w=majority`;
mongoose.connect(uri, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Get the model for representing trips
const Trip = require('../models/Trip');

// Adds the flights to our local MongoDB instance
const addFlights = async (flights) => {
    for (var tripIndex = 0; tripIndex < flights[0].length; tripIndex++) {
        console.log(`The price for trip ${tripIndex + 1} is: ` + flights[0][tripIndex].toString());
        console.log(`The duration for trip ${tripIndex + 1} is: ` + flights[1][tripIndex].toString());
        console.log(`The number of stops for trip ${tripIndex + 1} is: ` + flights[2][tripIndex].toString());
        console.log(`The stops themselves for trip ${tripIndex + 1} are: ` + flights[3][tripIndex].toString());
    }
}

exports.addFlights = addFlights;