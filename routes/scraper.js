// scraper.js - Contains logic for the scraper

var express = require('express');
var router = express.Router();

const puppeteer = require('puppeteer');

const db = require('./db');

// Returns the appropriate URL to scrape
const getUrl = async (origin, dest, departDate, returnDate, isRoundTrip) => {
    let baseUrl = `https://www.google.com/flights#flt=`

    if (isRoundTrip) {
        return baseUrl + `${origin}.${dest}.${departDate}*${dest}.${origin}.${returnDate}`;
    } else {
        return baseUrl + `${origin}.${dest}.${departDate};tt:o`;
    }
}

// Clicks through dropdowns to reveal detailed stop data for the best flights
const clickDropdowns = async (page) => {
    await page.evaluate(async () => {
        let elements = document.getElementsByClassName('gws-flights-results__best-flights')[0]
            .getElementsByClassName('gws-flights-results__expand');
        for (let element of elements) {
            element.click();
        }
    });
}

const getScrapedData = async (page) => {
    return await page.evaluate(() => {
        // get the elements in the ordered list of best flights
        let flights = Array.from(
            document.querySelectorAll('ol.gws-flights-results__result-list:nth-child(3) > li')
        );

        // get the prices
        const prices = flights.map(flight => {
            return flight
                .getElementsByClassName('gws-flights-results__itinerary-price')[0]
                .textContent
                .trim()
        });

        // get the trip durations
        const durations = flights.map(flight => {
            return flight
                .getElementsByClassName('gws-flights-results__duration')[0]
                .textContent
                .trim()
        });

        // get how many stops there are
        const stopCounts = flights.map(flight => {
            return flight
                .getElementsByClassName('gws-flights-results__stops')[0]
                .textContent
                .trim()
        });

        /**
         * -------------------------------------------------------------------
         * Scrape detailed stop info, which includes:
         * -------------------------------------------------------------------
         * IATA codes of origin and destination airports
         * Airline operator
         * Flight Number
         * Departure time
         * Arrival time
         * Travel duration
         * 
         */

        const stops = flights.map(flight => {
            // Get each flight
            const stopInfoSelectors = Array.from(flight.getElementsByClassName('gws-flights-results__leg'));

            let stopInfos = [];

            // Get each stop for a flight
            stopInfoSelectors.forEach(stopInfoSelector => {
                const IATA = stopInfoSelector
                    .getElementsByClassName('gws-flights-results__iata-code');
                const airline = stopInfoSelector
                    .getElementsByClassName('gws-flights-results__leg-flight')[0]
                    .querySelector('div')
                    .textContent;
                const flightNumber = stopInfoSelector
                    .getElementsByClassName('gws-flights-results__other-leg-info')[0]
                    .querySelector('span > span:nth-child(1)')
                    .textContent + stopInfoSelector
                        .getElementsByClassName('gws-flights-results__other-leg-info')[0]
                        .querySelector('span > span:nth-child(2)')
                        .textContent;
                const departureTime = stopInfoSelector
                    .getElementsByClassName('gws-flights-results__leg-departure')[0]
                    .querySelector('div')
                    .textContent
                    .trim();
                const arrivalTime = stopInfoSelector
                    .getElementsByClassName('gws-flights-results__leg-arrival')[0]
                    .querySelector('div')
                    .textContent
                    .trim();
                const travelDuration = stopInfoSelector
                    .getElementsByClassName('gws-flights-results__leg-duration')[0]
                    .querySelector('div > span')
                    .textContent
                    .trim();

                stopInfo = {
                    'origin': IATA[0].textContent,
                    'dest': IATA[1].textContent,
                    'airline': airline,
                    'flightNumber': flightNumber,
                    'departureTime': departureTime,
                    'arrivalTime': arrivalTime,
                    'duration': travelDuration
                };

                stopInfos.push(JSON.stringify(stopInfo));
            });

            return stopInfos;
        });

        // Give back all the info associated for the trip in an array
        return [prices, durations, stopCounts, stops];
    });
}

// Do we need to re-run the scraper?
const needsScraping = async (origin, dest, departDate, returnDate, isRoundTrip) => {
    const queryResult = await db.getQuery(origin, dest, departDate, returnDate, isRoundTrip);

    // Do a new scrape if it's over a day or hasn't been done yet
    if (queryResult.length == 0) {
        return true;
    } else {
        return ((new Date().getTime() - Date.parse(queryResult[0].updatedAt)) > 86400000);
    }
}

// Scrapes Google Flights data (for only the best flights)
const scrape = async (origin, dest, departDate, returnDate, isRoundTrip) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(await getUrl(origin, dest, departDate, returnDate, isRoundTrip),
        { waitUntil: 'networkidle0', timeout: 0 });

    // Sanity check - show us what we have so far
    await page.screenshot({ path: 'screenshot.png' });
    await clickDropdowns(page);

    if (await needsScraping(origin, dest, departDate, returnDate, isRoundTrip)) {
        await db.addFlights(origin, dest, departDate, returnDate, isRoundTrip, await getScrapedData(page));
        console.log('Did a fresh scrape!');
    } else {
        console.log('Last updated less than a day ago, retrieving from cache...');
    }

    // Get the trips associated with this scrape
    const scrapedData = await db.getTrips(origin, dest, departDate, returnDate, isRoundTrip);

    await browser.close();
    return scrapedData;
}

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

    // Mongoose doesn't cast undefined to false, so this is necessary
    isRoundTrip = isRoundTrip ? true : false;

    const flights = await scrape(origin, dest, departDate, returnDate, isRoundTrip)
        .then(data => { return data })
        .catch(err => console.log('Scraping failed, here\'s what went wrong: ' + err.toString()));

    res.render("results", {
        title: "Available Flights",
        heading: `Best results for ${origin} to ${dest}`,
        subheading: `${isRoundTrip ? "(Round Trip) Departing " + departDate + ", returning " + returnDate :
            "(One Way) Departing " + departDate}`,
        flights: flights
    });
});

module.exports = router;