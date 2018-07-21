// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var mongojs = require("mongojs");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Require request and cheerio. This makes the scraping possible
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request");
var rp = require('request-promise');

// Initialize Express
var app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// Database configuration
var databaseUrl = "news";
var collections = ["articles"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

var db = require("./models");

app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
    extended: true
}));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/articlespopulator");


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

app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({
            _id: req.params.id
        })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({
                _id: req.params.id
            }, {
                note: dbNote._id
            }, {
                new: true
            });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.get("/scrape", function (req, res) {
    var articleData = [];

    var options = {
        uri: 'http://www.startribune.com/local/',
        transform: function (body) {
            return cheerio.load(body);
        }
    };//End Options for Request-promise scrape
    rp(options)
        //Start First promise
        .then(function ($) {
            // Process html like you would with jQuery...

            $("div.tease-container-right").each(function (i, element) {

                var scrapedTitle = $(element).children("h3").text().trim().replace(/(\r\n|\n|\r|\t)/gm, "");
                //console.log("Scraped Title #" + i + ": " + scrapedTitle);

                var summaryScrape = $(element).children(".tease-summary").text().trim().replace(/(\r\n|\n|\r|\t)/gm, "");
                //console.log("  Summary #" + i + ": " + summaryScrape);

                var linkScrape = $(element).children("h3").children("a").attr('href');
                //console.log("  Link #" + i + ": " + linkScrape);

                // var imgScrape = $(element).children("div.tease-photo-img").children("img");
                // console.log("  Link #" + i + ": " + imgScrape);

                // Save these results in an object that we'll push into the results array we defined earlier
                articleData.push({
                    title: scrapedTitle,
                    summary: summaryScrape,
                    link: linkScrape
                });
            }); //End scraping list of articles

            console.log(articleData);
            

            res.render('scraped',{articles:articleData});

        }) //End first promise
        .catch(function (err) {
            console.log(err);
            // Crawling failed or Cheerio choked...
        });
}); //End app.get() for /scrape

app.get('addNote/:id')

/* -/-/-/-/-/-/-/-/-/-/-/-/- */

// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});