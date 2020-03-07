// tests/models.test.js - contains examples of our models

const Query = require('../models/Query');
const Trip = require('../models/Trip');

// -----------------------------------------
// Examples of Trips
// -----------------------------------------

const query1Trips = [
    new Trip({
        _id: '5e62dc3bf6a79f2b7d8f33e1',
        price: '$129',
        duration: '5h 45m',
        no_stops: 'Nonstop',
        stops: [{
            origin: 'SFO',
            dest: 'JFK',
            airline: 'American',
            flightNumber: 'AA16',
            departureTime: '11:35 AM',
            arrivalTime: '8:20 PM',
            duration: '5h 45m'
        }]
    }),
    new Trip({
        _id: '5e62dc3bf6a79f2b7d8f33e2',
        price: '$129',
        duration: '5h 45m',
        no_stops: 'Nonstop',
        stops: [{
            origin: 'SFO',
            dest: 'JFK',
            airline: 'Alaska',
            flightNumber: 'AS1024',
            departureTime: '1:30 PM',
            arrivalTime: '10:15 PM',
            duration: '5h 45m'
        }]
    }),
    new Trip({
        _id: '5e62dc3bf6a79f2b7d8f33e3',
        price: '$167',
        duration: '5h 31m',
        no_stops: 'Nonstop',
        stops: [{
            origin: 'SFO',
            dest: 'JFK',
            airline: 'JetBlue',
            flightNumber: 'B61516',
            departureTime: '11:59 PM',
            arrivalTime: '8:30 AM+1',
            duration: '5h 31m'
        }]
    })
];

const query2Trips = [
    new Trip({
        _id: '5e62dc3bf6a79f2b7d8f33e4',
        price: '$106',
        duration: '7h 20m',
        no_stops: '1 stop',
        stops: [{
            origin: 'LAX',
            dest: 'ATL',
            airline: 'Frontier',
            flightNumber: 'F91506',
            departureTime: '1:24 PM',
            arrivalTime: '9:02 PM',
            duration: '4h 38m'
        }, {
            origin: 'ATL',
            dest: 'MIA',
            airline: 'Frontier',
            flightNumber: 'F91506',
            departureTime: '9:47 PM',
            arrivalTime: '11:44 PM',
            duration: '1h 57m'
        }]
    }),
    new Trip({
        _id: '5e62dc3bf6a79f2b7d8f33e5',
        price: '$237',
        duration: '4h 41m',
        no_stops: 'Nonstop',
        stops: [{
            origin: 'LAX',
            dest: 'MIA',
            airline: 'American',
            flightNumber: 'AA1297',
            departureTime: '2:15 PM',
            arrivalTime: '9:56 PM',
            duration: '4h 41m'
        }]
    })
];

const query3Trips = [
    new Trip({
        _id: '5e62dc3bf6a79f2b7d8f33e6',
        price: '$468',
        duration: '25h 25m',
        no_stops: '1 stop',
        stops: [{
            origin: 'JFK',
            dest: 'SVO',
            airline: 'Aeroflot',
            flightNumber: 'SU103',
            departureTime: '8:25 PM',
            arrivalTime: '12:40 PM+1',
            duration: '9h 15m'
        }, {
            origin: 'SVO',
            dest: 'PEK',
            airline: 'Aeroflot',
            flightNumber: 'SU204',
            departureTime: '9:10 PM+1',
            arrivalTime: '9:50 AM+2',
            duration: '7h 40m'
        }]
    }),
    new Trip({
        _id: '5e62dc3bf6a79f2b7d8f33e7',
        price: '$683',
        duration: '21h 30m',
        no_stops: '1 stop',
        stops: [{
            origin: 'JFK',
            dest: 'HKG',
            airline: 'Cathay Pacific',
            flightNumber: 'CX845',
            departureTime: '1:15 AM',
            arrivalTime: '5:10 AM+1',
            duration: '15h 55m'
        }, {
            origin: 'HKG',
            dest: 'PEK',
            airline: 'Cathay Dragon',
            flightNumber: 'KA900',
            departureTime: '7:30 AM+1',
            arrivalTime: '10:45 AM+1',
            duration: '3h 15m' 
        }]
    })
];

const query4Trips = [
    new Trip({
        _id: '5e62dc3bf6a79f2b7d8f33e8',
        price: '$535',
        duration: '16h 30m',
        no_stops: '1 stop',
        stops: [{
            origin: 'DEL',
            dest: 'ZRH',
            airline: 'SWISS',
            flightNumber: 'LX147',
            departureTime: '2:05 AM',
            arrivalTime: '6:25 AM',
            duration: '8h 50m'
        }, {
            origin: 'ZRH',
            dest: 'FCO',
            airline: 'SWISS',
            flightNumber: 'LX1736',
            departureTime: '12:30 PM',
            arrivalTime: '2:05 PM',
            duration: '1h 35m'
        }]
    }),
    new Trip({
        _id: '5e62dc3bf6a79f2b7d8f33e9',
        price: '$653',
        duration: '8h 50m',
        no_stops: 'Nonstop',
        stops: [{
            origin: 'DEL',
            dest: 'FCO',
            airline: 'Alitalia',
            flightNumber: 'AZ769',
            departureTime: '4:00 AM',
            arrivalTime: '8:20 AM',
            duration: '8h 50m'
        }]
    })
];


// -----------------------------------------
// Examples of Queries
// -----------------------------------------

// domestic one-way
const examplesQuery1 = new Query({
    _id: '5e62dc3bf6a79f2b7d8f33ea',
    origin: 'SFO',
    dest: 'JFK',
    depart_date: '2020-03-22',
    return_date: '',
    is_round_trip: false,
    trips: [
        query1Trips[0]._id,
        query1Trips[1]._id,
        query1Trips[2]._id
    ]
});

// domestic round trip
const examplesQuery2 = new Query({
    _id: '5e62dc3bf6a79f2b7d8f33eb',
    origin: 'LAX',
    dest: 'MIA',
    depart_date: '2020-03-22',
    return_date: '2020-03-26',
    is_round_trip: true,
    trips: [
        query2Trips[0]._id,
        query2Trips[1]._id
    ]
});

// intl one-way
const examplesQuery3 = new Query({
    _id: '5e62dc3bf6a79f2b7d8f33ec',
    origin: 'JFK',
    dest: 'PEK',
    depart_date: '2020-03-18',
    return_date: '',
    is_round_trip: false,
    trips: [
        query3Trips[0]._id,
        query3Trips[1]._id
    ]
});

// intl round trip
const examplesQuery4 = new Query({
    _id: '5e62dc3bf6a79f2b7d8f33ed',
    origin: 'DEL',
    dest: 'FCO',
    depart_date: '2020-03-17',
    return_date: '2020-04-01',
    is_round_trip: true,
    trips: [
        query4Trips[0]._id,
        query4Trips[1]._id
    ]
});

describe('Making examples of Trips and Queries', () => {
    it('nothing blows up', async (done) => {
        done();
    });
});

module.exports = {
    examplesQuery1,
    examplesQuery2,
    examplesQuery3,
    examplesQuery4
}