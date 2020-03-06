// routes/index.js - routing for the homepage, where queries for flights can be made

var express = require('express');
var router = express.Router();

// GET home page
router.get('/', function(req, res, next) {
  res.render('index', { title: "Google Flights Scraper" });
});

module.exports = router;