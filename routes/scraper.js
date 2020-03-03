// scraper.js - Contains logic for the scraper

var express = require('express');
var router = express.Router();

const puppeteer = require('puppeteer');
const fullPageScreenshot = require('puppeteer-full-page-screenshot');

const scrape = async (origin, dest, departDate, returnDate, isRoundTrip) => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.setViewport({ width: 1920, height: 1080 });

    if (isRoundTrip) {
        await page.goto(`https://www.google.com/flights#flt=${origin}.${dest}.${departDate}*${dest}.${origin}.${returnDate}`)
    } else {
        await page.goto(`https://www.google.com/flights#flt=${origin}.${dest}.${departDate};tt:o`)
    }

    await page.screenshot({path: 'screenshot.png'});

    const scrapedData = await page.evaluate(() =>
        Array.from(
            document.querySelectorAll(
                'div.gws-flights-results__best-flights'
            )
        )
        /*.filter(node => node.querySelector('.graf--title'))
        .map(link => ({
            title: link.querySelector('.graf--title').textContent,
            link: link.getAttribute('data-action-value')
        }))*/
    );

    console.log(scrapedData)

    await browser.close()
    return scrapedData
}

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