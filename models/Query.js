// Query.js - represents a query and the trips associated with it

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Trips make up the queries
require('../models/Trip');

const Query = new Schema({
    origin: String,
    dest: String,
    depart_date: Date,
    return_date: Date,
    is_round_trip: Boolean,
    trips: [{ type: Schema.Types.ObjectId, ref: 'Trip' }]
}, { timestamps: true });

module.exports = mongoose.model('Query', Query);