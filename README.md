<img src="https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Google_Flights_logo.svg/1280px-Google_Flights_logo.svg.png" />

A simple scraper built in Node for Google Flights data using the Puppeteer library. The database is hosted on MongoDB Atlas. 
Try it out with `yarn start`

Given a query in the following format:

```
Query {
    origin: string;
    dest: string;
    departDate: string | Date;
    returnDate?: string | Date;
    isRoundTrip: boolean;
}
```

This scrapes for both a one way flights and round trip flights, recording the following information:

* Price :heavy_check_mark:
* Total travel duration :heavy_check_mark:
* Number of stops :heavy_check_mark:
* Information about each stop:
  - IATA codes of origin and destination airports :heavy_check_mark:
  - Airline operator :heavy_check_mark:
  - Flight Number :heavy_check_mark:
  - Departure time :heavy_check_mark:
  - Arrival time :heavy_check_mark:
  - Travel duration :heavy_check_mark:
