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

// Scrapes Google Flights data (for only the best flights)
const scrape = async (origin, dest, departDate, returnDate, isRoundTrip) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(await getUrl(origin, dest, departDate, returnDate, isRoundTrip),
        { waitUntil: 'networkidle0', timeout: 0 });

    // Sanity check - show us what we have so far
    await page.screenshot({ path: 'screenshot.png' });
    console.log('Screenshot taken!');

    await clickDropdowns(page);

    const scrapedData = await page.evaluate(() => {
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

    db.addFlights(scrapedData);

    await browser.close();
    return scrapedData;
}

// Renders the scraped data
router.post('/', (req, res) => {
    const { origin, dest, departDate, returnDate, isRoundTrip } = req.body;

    // Data validation
    if (!origin || !dest || !departDate) {
        res.render("results", { title: "Results", error: "You did not specify an origin, destination, or depature date!" });
    }

    if (isRoundTrip && !returnDate) {
        res.render("results", { title: "Results", error: "You did not specify a return date for this round trip flight!" });
    }

    // Now do the scraping
    const flights = new Promise((resolve, reject) => {
        scrape(origin, dest, departDate, returnDate, isRoundTrip)
            .then(data => {
                resolve(data)
            })
            .catch(err => reject('Google Flight scrape failed'))
    })

    // Pass in the data objects
    Promise.all(flights)
        .then(data => {
            res.render('results', { title: "Results", data: { flights: flights } })
        })
        .catch(err => res.status(500).send(err))
});

module.exports = router;