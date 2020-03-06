// routes/scraper.js - Handles data validation and routing for the scraper

var express = require('express');
var router = express.Router();

const scraper = require('../controllers/scraper');

// Validate all the inputs
const validate = async (origin, dest, departDate, returnDate, isRoundTrip) => {
    if (!origin || !dest || !departDate) {
        return "You did not specify either an origin, destination, or depature date!";
    }

    if (Date.parse(departDate) - Date.parse(new Date()) < 0) {
        return "You can't pick a departure date in the past!";
    }

    if (isRoundTrip && !returnDate) {
        return "You did not specify a return date for this round trip flight!";
    }

    if (returnDate && (returnDate <= departDate)) {
        return "Your return date must be after your departure date!";
    }
}

// Renders the scraped data, responding to a POST request
router.post('/', async (req, res, next) => {
    let { origin, dest, departDate, returnDate, isRoundTrip } = req.body;

    // Do data validation
    const possibleError = await validate(origin, dest, departDate, returnDate, isRoundTrip);

    if (possibleError) {
        res.render("error", {
            title: "Error",
            message: possibleError
        });
        return next();
    }

    // Mongoose unfortunately doesn't cast undefined to false, so this is necessary
    isRoundTrip = isRoundTrip ? true : false;

    // Render the scraper's response
    await scraper
        .scrape(origin, dest, departDate, returnDate, isRoundTrip)
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