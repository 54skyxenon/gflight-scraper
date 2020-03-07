// tests/controllers.test.js - contains tests for our controllers

jest.setTimeout(100000);

const puppeteer = require('puppeteer');
const scraper = require('../controllers/scraper');

describe('scraper/db logic', () => {
    let browser = null;
    let page = null;

    beforeEach(async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
    });

    afterEach(async () => {
        await browser.close();
    })

    it('getting one way url', async (done) => {
        expect(await scraper.getUrl('JFK', 'LAX', '2020-03-19', '', null))
            .toBe('https://www.google.com/flights#flt=JFK.LAX.2020-03-19;tt:o');
        done();
    });

    it('getting round trip url', async (done) => {
        expect(await scraper.getUrl('JFK', 'LAX', '2020-03-19', '2020-03-25', true))
            .toBe('https://www.google.com/flights#flt=JFK.LAX.2020-03-19*LAX.JFK.2020-03-25');
        done();
    });

    it('clicking through dropdowns doesn\'t blow up', async (done) => {
        await page.goto('https://www.google.com/flights#flt=JFK.LAX.2020-03-19;tt:o',
            { waitUntil: 'networkidle0', timeout: 0 });

        await scraper.clickDropdowns(page);
        done();
    });

    it('getting scraped data for invalid inputs gives nothing', async (done) => {
        await page.goto('https://www.google.com/flights#flt=JFK.JFK.2020-03-19;tt:o',
            { waitUntil: 'networkidle0', timeout: 0 });

        expect(await scraper.getScrapedData(page))
            .toEqual([[], [], [], []]);

        done();
    });

    it('getting scraped data #1', async (done) => {
        await page.goto('https://www.google.com/flights#flt=JFK.LAX.2020-03-19;tt:o',
            { waitUntil: 'networkidle0', timeout: 0 });

        const res = await scraper.getScrapedData(page);

        expect(res.length).toBe(4);
        expect(res[0].length).toBe(res[1].length);
        expect(res[1].length).toBe(res[2].length);
        expect(res[2].length).toBe(res[3].length);
        expect(typeof res[3]).toBe('object');

        done();
    });

    it('getting scraped data #2', async (done) => {
        await page.goto('https://www.google.com/flights#flt=JFK.LAX.2020-03-19*LAX.JFK.2020-03-25',
            { waitUntil: 'networkidle0', timeout: 0 });

        const res = await scraper.getScrapedData(page);

        expect(res.length).toBe(4);
        expect(res[0].length).toBe(res[1].length);
        expect(res[1].length).toBe(res[2].length);
        expect(res[2].length).toBe(res[3].length);
        expect(typeof res[3]).toBe('object');

        done();
    });
});