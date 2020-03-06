// routes/scraper.js - Handles data validation and routing for the scraper

var express = require('express');
var router = express.Router();

const scraper = require('../controllers/scraper');

// Renders the scraped data
router.post('/', async (req, res, next) => {
    let { origin, dest, departDate, returnDate, isRoundTrip } = req.body;

    // Data validation
    if (!origin || !dest || !departDate) {
        res.render("error", {
            title: "Error",
            message: "You did not specify either an origin, destination, or depature date!"
        });
        return next();
    }

    if (isRoundTrip && !returnDate) {
        res.render("error", {
            title: "Error",
            message: "You did not specify a return date for this round trip flight!"
        });
        return next();
    }

    if (returnDate && (returnDate <= departDate)) {
        res.render("error", {
            title: "Error",
            message: "Your return date must be after your departure date!"
        });
        return next();
    }

    // Mongoose unfortunately doesn't cast undefined to false, so this is necessary
    isRoundTrip = isRoundTrip ? true : false;

    // Render the scraper's response
    await scraper(origin, dest, departDate, returnDate, isRoundTrip)
        .then(data => {
            res.render("results", {
                title: "Available Flights",
                heading: `Best results for ${origin} to ${dest}`,
                subheading: `${isRoundTrip ? "(Round Trip) Departing " + departDate + ", returning " + returnDate :
                    "(One Way) Departing " + departDate}`,
                flights: data[0],
                lastUpdatedAt: data[1]
            });
        })
        .catch(err => {
            console.log('Scraping failed, there were probably no results');
            res.render("error", {
                title: "Error",
                message: "Your query returned no results."
            });
            return next();
        });
});

module.exports = router;