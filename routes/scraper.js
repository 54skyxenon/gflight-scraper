// scraper.js - Contains logic for the scraper

var express = require('express');
var router = express.Router();

const puppeteer = require('puppeteer');

// Returns data for the best flights
const scrape = async (origin, dest, departDate, returnDate, isRoundTrip) => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.setViewport({ width: 1920, height: 1080 });

    if (isRoundTrip) {
        await page.goto(`https://www.google.com/flights#flt=${origin}.${dest}.${departDate}*${dest}.${origin}.${returnDate}`,  
        { waitUntil: 'networkidle0', timeout: 0 });
    } else {
        await page.goto(`https://www.google.com/flights#flt=${origin}.${dest}.${departDate};tt:o`,  
        { waitUntil: 'networkidle0', timeout: 0 });
    }

    await page.screenshot({ path: 'screenshot.png' });
    console.log("screenshot taken!")

    const scrapedData = await page.evaluate(() => {
        let flights = Array.from(document.querySelectorAll('ol.gws-flights-results__result-list:nth-child(3) > li'));
        
        const prices = flights.map(flight => {
            return flight.querySelector('div:nth-child(1) > div:nth-child(1) > div:nth-child(2) ' +
                                        '> div:nth-child(2) > div:nth-child(1) > div:nth-child(6) ' +
                                        '> div:nth-child(1)')
            .textContent
            .toString()
            .trim()
        });

        const durations = flights.map(flight => {
            return flight.querySelector('div:nth-child(1) > div:nth-child(1) > div:nth-child(2) ' +
                                        '> div:nth-child(2) > div:nth-child(1) > div:nth-child(3) ' +
                                        '> div:nth-child(1)')
            .textContent
            .toString()
            .trim()
        });

        const stopCounts = flights.map(flight => {
            const stopCount = flight.querySelector('div:nth-child(1) > div:nth-child(1) > ' +
                                                'div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > ' + 
                                                'div:nth-child(4) > div:nth-child(1) > div:nth-child(1) > ' + 
                                                'div:nth-child(1) > span:nth-child(1)')
            .textContent
            .toString()
            return stopCount === "Nonstop" ? '0 stops' : stopCount
        });

        return [prices, durations, stopCounts];
    });

    console.log("The prices are: " + scrapedData[0].toString())
    console.log("The travel durations are: " + scrapedData[1].toString())
    console.log("The number of stops are: " + scrapedData[2].toString())

    await browser.close()
    return scrapedData
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