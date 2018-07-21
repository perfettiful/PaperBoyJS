// Using this template, the cheerio documentation,
// and what you've learned in class so far, scrape a website
// of your choice, save information from the page in a result array, and log it to the console.

var cheerio = require("cheerio");
var request = require("request");
var rp = require('request-promise');


// Make a request call to grab the HTML body from the site of your choice
request("http://www.startribune.com/local/", function(error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  // An empty array to save the data that we'll scrape
  var articles = [];

  // Select each element in the HTML body from which you want information.
  // NOTE: Cheerio selectors function similarly to jQuery's selectors,
  // but be sure to visit the package's npm page to see how it works
  $("h3").each(function(i, element) {
    var link = $(element).children().attr("href");
    var title = $(element).children().text();

    // Save these results in an object that we'll push into the results array we defined earlier
    articles.push({
      title: title,
      link: link
    });
  });//End scraping list of articles


  // Log the results once you've looped through each of the elements found with cheerio
  //console.log(results[0]);
  //console.log(results);
});

//_-------Start Cheerio Scrape with Request-Promise----------//

var options = {
    uri: 'http://www.startribune.com/local/',
    transform: function (body) {
        return cheerio.load(body);
    }
};
 

var articleData = [];

rp(options)
//Start First promise
    .then(function ($) {
        // Process html like you would with jQuery...
        
        $("div.tease-container-right").each(function(i, element) {
           
            var scrapedTitle = $(element).children("h3").text().trim().replace(/(\r\n|\n|\r|\t)/gm, "");
            console.log("Scraped Title #" + i + ": "+ scrapedTitle);

            var summaryScrape = $(element).children(".tease-summary").text().trim().replace(/(\r\n|\n|\r|\t)/gm, "");
            console.log("  Summary #" + i + ": "+ summaryScrape);

            var linkScrape = $(element).children("h3").children("a").attr('href');
            console.log("  Link #" + i + ": "+ linkScrape);

            var imgScrape = $(element).children("div.tease-photo-img").children("img");
            console.log("  Link #" + i + ": "+ imgScrape);


            // Save these results in an object that we'll push into the results array we defined earlier
            articleData.push({
              //title: title,
              //link: link
            });
          });//End scraping list of articles
        
          // Log the results once you've looped through each of the elements found with cheerio
          //console.log(scrapedTitle);
          
    })//End first promise
    .catch(function (err) {

        console.log(err);
        // Crawling failed or Cheerio choked...
    });



//_-------End Cheerio Scrape with Request-Promise----------//

