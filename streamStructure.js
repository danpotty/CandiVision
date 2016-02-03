/**
 * @Original Author: Danny Gillies
 */

// List of keywords to be captured
// function startTweets() {
var sentiment = require('sentiment');
var bernieTags = ["#Bernie2016"];
var trumpTags = ["#Trump2016"];

var Twit = require("twit");

// Twitter dev information, using a temporary twitter account for this application. Do not need to change
var T = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

var Tweet = require("./models/tweet.js");
var mongoose = require("mongoose");

// Connect to database (Make sure this is only called once
mongoose.connect("mongodb://localhost/campaign-test");
//var config = require("./config.js");

// Stores database in a variable
var db = mongoose.connection;

// Error handling for being unable to connect
db.on("error", console.error.bind(console, "connection error:"));

// Opens the database connection to wait for tweets
db.once("open", function() {
    console.log("Connected to database, waiting for tweets...");
    waitForTweets(db)
});

var waitForTweets = function(db) {
    var collection = db.collection("tweets");

    // Track tweets with the keyword "#FeelTheBern"
    var stream = T.stream("statuses/filter", {
        track: bernieTags,
        language: "en"
    })
    var stream2 = T.stream("statuses/filter", {
        track: trumpTags,
        language: "en"
    });

    // Start the stream, and store the JSON information in data
    console.log("Stream on")
    stream.on("tweet", function(data) {
        console.log("before sentiment")
        sentiment(data.text, function(err, result) {
            // Create the tweet object
            var tweet = new Tweet({
                id: data.id,
                raw: data,
                user: data.user.screen_name,
                description: data.text,
                sentiment: result.score,
                timestamp: data.timestamp_ms,
                created_at: data.created_at
            });

            // var sentimentArray = [];
            // sentimentArray.push(tweet.sentiment.result.score);

            //timer -- every 5 seconds, take avg of array and push to client for dv

            // Store the tweet in the database
            tweet.save(function(err, tweet) {
                if (err) return console.error(err);
                console.log("(" + tweet.created_at + ") scored " + tweet.sentiment + ": " + tweet.description);
                console.log("");
            });
        });
    })

    stream2.on("tweet", function(data) {
        sentiment(data.text, function(err, result) {
            // Create the tweet object
            var tweet = new Tweet({
                id: data.id,
                raw: data,
                user: data.user.screen_name,
                description: data.text,
                sentiment: result.score,
                timestamp: data.timestamp_ms,
                created_at: data.created_at
            });

            // Store the tweet in the database
            tweet.save(function(err, tweet) {
                if (err) return console.error(err);
                console.log("(" + tweet.created_at + ") scored " + tweet.sentiment + ": " + tweet.description);
                console.log("");
            });
        });
    })
}
