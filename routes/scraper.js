// scraper.js - Contains logic for the scraper

var express = require('express');
var router = express.Router();

const puppeteer = require('puppeteer');

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
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(await getUrl(origin, dest, departDate, returnDate, isRoundTrip), { waitUntil: 'networkidle0', timeout: 0 })

    await clickDropdowns(page);

    // Sanity check - show us what we have so far
    await page.screenshot({ path: 'screenshot.png' });
    console.log('Screenshot taken!');

    const scrapedData = await page.evaluate(() => {
        // get the elements in the ordered list of best flights
        let flights = Array.from(document.querySelectorAll('ol.gws-flights-results__result-list:nth-child(3) > li'));

        // get the prices
        const prices = flights.map(flight => {
            return flight.querySelector('div:nth-child(1) > div:nth-child(1) > div:nth-child(2) ' +
                '> div:nth-child(2) > div:nth-child(1) > div:nth-child(6) ' +
                '> div:nth-child(1)')
                .textContent
                .toString()
                .trim()
        });

        // get the trip durations
        const durations = flights.map(flight => {
            return flight.querySelector('div:nth-child(1) > div:nth-child(1) > div:nth-child(2) ' +
                '> div:nth-child(2) > div:nth-child(1) > div:nth-child(3) ' +
                '> div:nth-child(1)')
                .textContent
                .toString()
                .trim()
        });

        // get how many stops there are
        const stopCounts = flights.map(flight => {
            return flight.querySelector('div:nth-child(1) > div:nth-child(1) > ' +
                'div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > ' +
                'div:nth-child(4) > div:nth-child(1) > div:nth-child(1) > ' +
                'div:nth-child(1) > span:nth-child(1)')
                .textContent
                .toString()
        });

        /**
         * -------------------------------------------
         * Scrape detailed stop info, which includes:
         * -------------------------------------------
         * IATA codes of origin and destination airports
         * Airline operator
         * Flight Number
         * Departure time
         * Arrival time
         * Travel duration
         * 
         */

        const stops = flights.map(flight => {
            const stopInfoSelectors = Array.from(flight.getElementsByClassName('gws-flights-results__leg'));

            let stopInfos = [];

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

                stopInfos.push([IATA[0].textContent, IATA[1].textContent, airline, flightNumber, departureTime, arrivalTime, travelDuration]);
            });

            return stopInfos;
        })

        return [prices, durations, stopCounts, stops];
    });

    console.log("The prices are: " + scrapedData[0].toString());
    console.log("The travel durations are: " + scrapedData[1].toString());
    console.log("The number of stops are: " + scrapedData[2].toString());
    console.log("The stops themselves are: " + scrapedData[3].toString());

    await browser.close();
    return scrapedData;
}

// Does data validation, receives the data, and renders it
router.post('/', (req, res) => {
    const { origin, dest, departDate, returnDate, isRoundTrip } = req.body;

    if (!origin || !dest || !departDate) {
        res.render("results", { title: "Results" });
    }

    if (isRoundTrip && !returnDate) {
        res.render("results", { title: "Results" });
    }

    const flights = new Promise((resolve, reject) => {
        scrape(origin, dest, departDate, returnDate, isRoundTrip)
            .then(data => {
                resolve(data)
            })
            .catch(err => reject('Google Flight scrape failed'))
    })

    Promise.all(flights)
        .then(data => {
            res.render('results', { title: "Results", data: { flights: flights } })
        })
        .catch(err => res.status(500).send(err))
});

module.exports = router;