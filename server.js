// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
var cheerio = require("cheerio");
var request = require("request");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "news";
var collections = ["articles"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});


// Main route (simple Hello World Message)
app.get("/", function (req, res) {
    res.send("Welcome to PaperBoyJS");
});

app.get("/all", function (req, res) {
    // Query: In our database, go to the animals collection, then "find" everything
    db.news.find({}, function (err, data) {
        // Log any errors if the server encounters one
        if (err) {
            console.log(err);
        } else {
            // Otherwise, send the result of this query to the browser
            res.json(data);
        }
    });
});

app.post("/scrape", function (req, res) {

    var cheerioScrapePromise = new Promise(function (resolve, reject) {
        // Query: In our database, go to the animals collection, then "find" everything
        request("http://www.startribune.com/local/", function (error, response, html) {

            // Load the HTML into cheerio and save it to a variable
            // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
            var $ = cheerio.load(html);

            // An empty array to save the data that we'll scrape
            var results = [];

            // Select each element in the HTML body from which you want information.
            // NOTE: Cheerio selectors function similarly to jQuery's selectors,
            // but be sure to visit the package's npm page to see how it works
            $("h3").each(function (i, element) {

                var link = $(element).children().attr("href");
                var title = $(element).children().text();

                // Save these results in an object that we'll push into the results array we defined earlier
                results.push({
                    title: title,
                    link: link
                });
            });
            resolve(results);
        });

    }); //End cheerioScrapePromise

    cheerioScrapePromise.then(function (results) {
        //console.log(results[10]);
        results.forEach(video => {
            db.scraper.insert(video, function () {}); //End Each loop for scraping title and link
        });
        res.send("Posted All Video!!!!");
        // expected output: "Success!"
    });
}); //End app.post() for /scrape

/* -/-/-/-/-/-/-/-/-/-/-/-/- */

// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});