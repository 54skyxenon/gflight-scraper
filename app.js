var express = require('express');
var path = require('path');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// route for our homepage
var indexRouter = require('./routes/index');
app.use('/', indexRouter);

// route where we query the scraper
var scraperRouter = require('./routes/scraper');
app.use('/scraper', scraperRouter);

module.exports = app;