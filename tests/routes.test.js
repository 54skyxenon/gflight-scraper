// tests/routes.tests.js - contains tests for the routing

const app = require('../app');
const request = require('supertest');

jest.setTimeout(100000);

describe('index route', () => {
    it('visiting the homepage works', async (done) => {
        await request(app)
            .get('/')
            .expect(200);
        done();
    });
});

describe('scraper route', () => {
    it('get request to the scraper fails', async (done) => {
        await request(app)
            .get('/scraper')
            .expect(404);
        done();
    });


    it('empty post request to the scraper gives an error', async (done) => {
        const response = JSON.parse(
            JSON.stringify(
                await request(app)
                    .post('/scraper')
                    .send({})
            )
        );

        expect(response.text
            .includes('You did not specify either an origin, destination, or depature date!'))
            .toBe(true);

        done();
    });

    it('no origin gives an error', async (done) => {
        const response = JSON.parse(
            JSON.stringify(
                await request(app)
                    .post('/scraper')
                    .send({
                        origin: '', 
                        dest: 'JFK', 
                        departDate: '2020-03-19',
                        returnDate: '',
                        isRoundTrip: null
                    })
            )
        );
        
        expect(response.text
            .includes('You did not specify either an origin, destination, or depature date!'))
            .toBe(true);

        done();
    });

    it('no destination gives an error', async (done) => {
        const response = JSON.parse(
            JSON.stringify(
                await request(app)
                    .post('/scraper')
                    .send({
                        origin: 'JFK', 
                        dest: '', 
                        departDate: '2020-03-19',
                        returnDate: '',
                        isRoundTrip: null
                    })
            )
        );
        
        expect(response.text
            .includes('You did not specify either an origin, destination, or depature date!'))
            .toBe(true);

        done();
    });

    it('no departure date gives an error', async (done) => {
        const response = JSON.parse(
            JSON.stringify(
                await request(app)
                    .post('/scraper')
                    .send({
                        origin: 'JFK', 
                        dest: 'LAX', 
                        departDate: '',
                        returnDate: '',
                        isRoundTrip: null
                    })
            )
        );
        
        expect(response.text
            .includes('You did not specify either an origin, destination, or depature date!'))
            .toBe(true);

        done();
    });

    it('one way trip succeeds #1', async (done) => {
        const response = JSON.parse(
            JSON.stringify(
                await request(app)
                    .post('/scraper')
                    .send({
                        origin: 'JFK', 
                        dest: 'LAX', 
                        departDate: '2020-03-19',
                        returnDate: '',
                        isRoundTrip: null
                    })
            )
        );
        
        expect(response.text
            .includes('Best results for'))
            .toBe(true);

        done();
    });

    it('one way trip succeeds #2', async (done) => {
        const response = JSON.parse(
            JSON.stringify(
                await request(app)
                    .post('/scraper')
                    .send({
                        origin: 'JFK', 
                        dest: 'PEK', 
                        departDate: '2020-03-15',
                        returnDate: '',
                        isRoundTrip: null
                    })
            )
        );
        
        expect(response.text
            .includes('Best results for'))
            .toBe(true);

        done();
    });

    it('round trip fails without return date', async (done) => {
        const response = JSON.parse(
            JSON.stringify(
                await request(app)
                    .post('/scraper')
                    .send({
                        origin: 'JFK', 
                        dest: 'PEK', 
                        departDate: '2020-03-16',
                        returnDate: '',
                        isRoundTrip: true
                    })
            )
        );
        
        expect(response.text
            .includes('You did not specify a return date for this round trip flight!'))
            .toBe(true);

        done();
    });

    it('round trip fails when return date doesnt come after departure date', async (done) => {
        const response = JSON.parse(
            JSON.stringify(
                await request(app)
                    .post('/scraper')
                    .send({
                        origin: 'JFK', 
                        dest: 'PEK', 
                        departDate: '2020-03-16',
                        returnDate: '2020-03-13',
                        isRoundTrip: true
                    })
            )
        );
        
        expect(response.text
            .includes('Your return date must be after your departure date!'))
            .toBe(true);

        done();
    });

    it('round trip succeeds #1', async (done) => {
        const response = JSON.parse(
            JSON.stringify(
                await request(app)
                    .post('/scraper')
                    .send({
                        origin: 'JFK', 
                        dest: 'LAX', 
                        departDate: '2020-03-19',
                        returnDate: '2020-03-29',
                        isRoundTrip: true
                    })
            )
        );
        
        expect(response.text
            .includes('Best results for'))
            .toBe(true);

        done();
    });

    it('round trip succeeds #2', async (done) => {
        const response = JSON.parse(
            JSON.stringify(
                await request(app)
                    .post('/scraper')
                    .send({
                        origin: 'BNA', 
                        dest: 'PEK', 
                        departDate: '2020-03-19',
                        returnDate: '2020-04-01',
                        isRoundTrip: true
                    })
            )
        );
        
        expect(response.text
            .includes('Best results for'))
            .toBe(true);

        done();
    });

    it('fails when you are too far into the future', async (done) => {
        const response = JSON.parse(
            JSON.stringify(
                await request(app)
                    .post('/scraper')
                    .send({
                        origin: 'BNA', 
                        dest: 'PEK', 
                        departDate: '2030-05-19',
                        returnDate: '2030-12-01',
                        isRoundTrip: true
                    })
            )
        );
        
        expect(response.text
            .includes('Your query returned no results.'))
            .toBe(true);

        done();
    });

    it('fails when IATA formatting is wrong', async (done) => {
        const response = JSON.parse(
            JSON.stringify(
                await request(app)
                    .post('/scraper')
                    .send({
                        origin: 'lorem', 
                        dest: 'ipsum', 
                        departDate: '2020-03-19',
                        returnDate: '2020-03-25',
                        isRoundTrip: true
                    })
            )
        );
        
        expect(response.text
            .includes('Your query returned no results.'))
            .toBe(true);

        done();
    });
})

describe('404', () => {
    it('returns 404 status for unknown path', async (done) => {
        await request(app)
            .get('/sdfsdffsdssfd')
            .expect(404);
        done();
    });
});