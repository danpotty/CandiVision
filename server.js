"use strict";
require("dotenv").config({
    silent: true
});
let express = require('express');
let helmet = require("helmet");
let bodyParser = require('body-parser');
let app = express();
let port = process.env.PORT || 3000;
let mongoose = require("mongoose");
let passport = require("passport");
let session = require('express-session');
let sentiment = require('sentiment');
let stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);
let dailyTimer = require('./timer.js');
let tweetReset = require('./tweetReset.js');

require("./models/user");
require('./models/candidate');
require('./models/tweet');
require('./models/comment');
require('./models/invoice');
require("./config/passport");
let Candidate = mongoose.model("Candidate");
mongoose.connect(process.env.MONGO_URL);

app.set('views', './views');
app.engine('.html', require('ejs').renderFile);
app.use(express.static('./dist'));
app.use(express.static('./bower_components'));
app.set('view engine', 'html');
app.set('view options', {
    layout: false
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUnitialized: true
}));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());

let userRoutes = require('./routes/userRoutes');
let candidateRoutes = require('./routes/candidateRoutes');
let commentRoutes = require('./routes/commentRoutes');
let tweetRoutes = require('./routes/tweetRoutes');
let emailRoutes = require('./routes/emailRoutes');
let invoiceRoutes = require('./routes/invoiceRoutes');
let smsRoutes = require('./routes/smsRoutes');

app.use('/api/v1/users/', userRoutes);
app.use('/api/v1/candidates/', candidateRoutes);
app.use('/api/v1/comments/', commentRoutes);
app.use('/api/v1/tweets/', tweetRoutes);
app.use('/api/v1/contact/', emailRoutes);
app.use('/api/v1/invoice/', invoiceRoutes);
app.use('/api/v1/sms/', smsRoutes);

app.get('/*', function(req, res) {
    res.render('index');
});

tweetReset();

dailyTimer();



//START OF TWEET STREAM

//tracked hashtags
var startTags = ["#Bernie2016", "#FeelTheBern", "#NoBernie", "#StopSanders", "#Hillary2016", "#Clinton2016", "#OhHillNo", "#StopHillary2016", "#Trump2016", "#MakeAmericaGreatAgain", "#DumpTrump", "#FuckTrump", "#Rubio2016", "#TeamMarco", "#NoRubio", "#RubioLies"];

var bernieTags = ["#bernie2016", "#feelthebern", "#nobernie", "#stopsanders"];
var clintonTags = ["#hillary2016", "#clinton2016", "#ohhillno", "#stophillary2016"];
var trumpTags = ["#trump2016", "#whyisupporttrump", "#dumptrump", "#fucktrump"];
var rubioTags = ["#rubio2016", "#teammarco", "#norubio", "#rubiolies"]

var berniePos = ["#bernie2016", "#feelthebern"];
var clintonPos = ["#hillary2016", "#clinton2016"];
var trumpPos = ["#trump2016", "#makeamericagreatagain"];
var rubioPos = ["#rubio2016", "#teammarco"];

var bernieNeg = ["#nobernie", "#stopsanders"];
var clintonNeg = ["ohhillno", "#stophillary2016"];
var trumpNeg = ["#dumptrump", "#fucktrump"];
var rubioNeg = ["#norubio", "#rubiolies"];



var Twit = require("twit");

var T = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

var Tweet = require("./models/tweet.js");

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
    // mongoose.connection.db.dropCollection('candidates', function(err, result) {
    //     if(err) return next(err);
    // });


    // var bernie = new Candidate({
    //     id: 1,
    //     name: "Bernie Sanders",
    //     sentiment: 0,
    //     dailyRating: {
    //       posTweets: 0,
    //       totalTweets: 0
    //     }
    // });

    // bernie.save(function(err, bernie) {
    //     if (err) return console.error(err)
    //     console.log("INIT " + bernie.name);
    // });

    // var hillary = new Candidate({
    //     id: 2,
    //     name: "Hillary Clinton",
    //     sentiment: 0,
    //     dailyRating: {
    //       posTweets: 0,
    //       totalTweets: 0
    //     }
    // });

    // hillary.save(function(err, hillary) {
    //     if (err) return console.error(err)
    //     console.log("INIT " + hillary.name);
    // });

    // var donald = new Candidate({
    //     id: 3,
    //     name: "Donald Trump",
    //     sentiment: 0,
    //     dailyRating: {
    //       posTweets: 0,
    //       totalTweets: 0
    //     }
    // });

    // donald.save(function(err, donald) {
    //     if (err) return console.error(err)
    //     console.log("INIT " + donald.name);
    // });

    // var rubio = new Candidate({
    //     id: 4,
    //     name: "Marco Rubio",
    //     sentiment: 0,
    //     dailyRating: {
    //         posTweets: 0,
    //         totalTweets: 0
    //     }
    // });

    // rubio.save(function(err, rubio) {
    //     if(err) return console.log(err)
    //         console.log("INIT " + rubio.name);
    // });

    var stream = T.stream("statuses/filter", {
        track: startTags,
        language: "en"
    });

    stream.on('connect', function(request) {
        console.log("connect")
            //...
    })

    stream.on('connected', function(request) {
        console.log("finish connect")
            //...
    })

    stream.on('disconnect', function(disconnectMessage) {
        console.log("disconnect")
            //...
    })

    stream.on('reconnect', function(request, response, connectInterval) {
        console.log("reconnect - " + connectInterval + " " + JSON.stringify(response));
    })


    // Start the stream, and store the JSON information in data
    console.log("STREAM ON");
    stream.on("tweet", function(data) {

        //iterates through bernieTags
        for (var i = 0; i < berniePos.length; i++) {
            //set to lowercase and compare
            if (data.text.toLowerCase().match(berniePos[i])) {
                sentiment(data.text, function(err, result) {
                    if (result.score >= 0) {

                        //create new tweet
                        var tweet = new Tweet({
                            candidate: "Bernie Sanders",
                            user: data.user.screen_name,
                            description: data.text,
                            sentiment: result.score,
                            created_at: data.created_at
                        });

                        Candidate.update({ name : "Bernie Sanders" }, { $inc : { 'dailyRating.posTweets':1 }}, (err, result) => {
                          if (err) console.log(err);
                        });
                        Candidate.update({ name : "Bernie Sanders" }, { $inc : { 'dailyRating.totalTweets':1 }}, (err, result) => {
                          if (err) console.log(err);
                        });

                        //save
                        tweet.save(function(err, tweet) {
                            if (err) return console.error(err)
                            console.log(tweet.candidate + " (" + tweet.created_at + ") scored " + tweet.sentiment + ": " + tweet.description);
                            console.log("");
                        });
                    }
                });
            }
        }

        //iterates through bernieTags
        for (var i = 0; i < bernieNeg.length; i++) {
            //set to lowercase and compare
            if (data.text.toLowerCase().match(bernieNeg[i])) {
                sentiment(data.text, function(err, result) {
                    if (result.score < 0) {

                        //create new tweet
                        var tweet = new Tweet({
                            candidate: "Bernie Sanders",
                            user: data.user.screen_name,
                            description: data.text,
                            sentiment: result.score,
                            created_at: data.created_at
                        });

                        Candidate.update({ name : "Bernie Sanders" }, { $inc : { 'dailyRating.totalTweets':1 }}, (err, result) => {
                          if (err) console.log(err);
                        });

                        //save
                        tweet.save(function(err, tweet) {
                            if (err) return console.error(err)
                            console.log(tweet.candidate + " (" + tweet.created_at + ") scored " + tweet.sentiment + ": " + tweet.description);
                            console.log("");
                        });

                    }

                });
            }
        }

        for (var i = 0; i < clintonPos.length; i++) {
            //set to lowercase and compare
            if (data.text.toLowerCase().match(clintonPos[i])) {
                sentiment(data.text, function(err, result) {
                    if (result.score >= 0) {

                      //create new tweet
                      var tweet = new Tweet({
                          candidate: "Hillary Clinton",
                          user: data.user.screen_name,
                          description: data.text,
                          sentiment: result.score,
                          created_at: data.created_at
                      });

                      Candidate.update({ name: 'Hillary Clinton' }, { $inc : { 'dailyRating.posTweets':1 }}, (err, res) => {
                        if (err) console.log(err);
                      });
                      Candidate.update({ name: 'Hillary Clinton' }, { $inc : { 'dailyRating.totalTweets':1 }}, (err, res) => {
                        if (err) console.log(err);
                      });

                        //save
                        tweet.save(function(err, tweet) {
                            if (err) return console.error(err)
                            console.log(tweet.candidate + " (" + tweet.created_at + ") scored " + tweet.sentiment + ": " + tweet.description);
                            console.log("");
                        });
                    }
                });
            }
        }

        for (var i = 0; i < clintonNeg.length; i++) {
            //set to lowercase and compare
            if (data.text.toLowerCase().match(clintonNeg[i])) {
                sentiment(data.text, function(err, result) {
                    if (result.score < 0) {

                      //create new tweet
                      var tweet = new Tweet({
                          candidate: "Hillary Clinton",
                          user: data.user.screen_name,
                          description: data.text,
                          sentiment: result.score,
                          created_at: data.created_at
                      });

                      Candidate.update({ name: 'Hillary Clinton' }, { $inc : { 'dailyRating.totalTweets':1}}, (err, res) => {
                        if (err) console.log(err);
                      });

                      //save
                      tweet.save(function(err, tweet) {
                          if (err) return console.error(err)
                          console.log(tweet.candidate + " (" + tweet.created_at + ") scored " + tweet.sentiment + ": " + tweet.description);
                          console.log("");
                      });

                    }

                });
            }
        }

        for (var i = 0; i < trumpPos.length; i++) {
            //set to lowercase and compare
            if (data.text.toLowerCase().match(trumpPos[i])) {
                sentiment(data.text, function(err, result) {
                    if (result.score >= 0) {

                        //create new tweet
                        var tweet = new Tweet({
                            candidate: "Donald Trump",
                            user: data.user.screen_name,
                            description: data.text,
                            sentiment: result.score,
                            created_at: data.created_at
                        });

                        Candidate.update({ name: 'Donald Trump' }, { $inc: { 'dailyRating.posTweets':1}}, (err, res) => {
                          if (err) console.log(err);
                        });
                        Candidate.update({ name: 'Donald Trump' }, { $inc: { 'dailyRating.totalTweets':1}}, (err, res) => {
                          if (err) console.log(err);
                        });

                        //save
                        tweet.save(function(err, tweet) {
                            if (err) return console.error(err)
                            console.log(tweet.candidate + " (" + tweet.created_at + ") scored " + tweet.sentiment + ": " + tweet.description);
                            console.log("");
                        });
                    }
                });
            }
        }

        for (var i = 0; i < trumpNeg.length; i++) {
            //set to lowercase and compare
            if (data.text.toLowerCase().match(trumpNeg[i])) {
                sentiment(data.text, function(err, result) {
                    if (result.score < 0) {

                        //create new tweet
                        var tweet = new Tweet({
                            candidate: "Donald Trump",
                            user: data.user.screen_name,
                            description: data.text,
                            sentiment: result.score,
                            created_at: data.created_at
                        });

                        Candidate.update({ name: 'Donald Trump' }, { $inc: { 'dailyRating.totalTweets':1}}, (err, res) => {
                          if (err) console.log(err);
                        });

                        //save
                        tweet.save(function(err, tweet) {
                            if (err) return console.error(err)
                            console.log(tweet.candidate + " (" + tweet.created_at + ") scored " + tweet.sentiment + ": " + tweet.description);
                            console.log("");
                        });

                    }

                });
            }
        }

        for (var i = 0; i < rubioPos.length; i++) {
            //set to lowercase and compare
            if (data.text.toLowerCase().match(rubioPos[i])) {
                sentiment(data.text, function(err, result) {
                    if (result.score >= 0) {

                        //create new tweet
                        var tweet = new Tweet({
                            candidate: "Marco Rubio",
                            user: data.user.screen_name,
                            description: data.text,
                            sentiment: result.score,
                            created_at: data.created_at
                        });

                        Candidate.update({ name: 'Marco Rubio' }, { $inc: { 'dailyRating.posTweets':1}}, (err, res) => {
                          if (err) console.log(err);
                        });
                        Candidate.update({ name: 'Marco Rubio' }, { $inc: { 'dailyRating.totalTweets':1}}, (err, res) => {
                          if (err) console.log(err);
                        });

                        //save
                        tweet.save(function(err, tweet) {
                            if (err) return console.error(err)
                            console.log(tweet.candidate + " (" + tweet.created_at + ") scored " + tweet.sentiment + ": " + tweet.description);
                            console.log("");
                        });
                    }
                });
            }
        }

        for (var i = 0; i < rubioNeg.length; i++) {
            //set to lowercase and compare
            if (data.text.toLowerCase().match(rubioNeg[i])) {
                sentiment(data.text, function(err, result) {
                    if (result.score < 0) {

                        //create new tweet
                        var tweet = new Tweet({
                            candidate: "Marco Rubio",
                            user: data.user.screen_name,
                            description: data.text,
                            sentiment: result.score,
                            created_at: data.created_at
                        });

                        Candidate.update({ name: 'Marco Rubio' }, { $inc: { 'dailyRating.totalTweets':1}}, (err, res) => {
                          if (err) console.log(err);
                        });

                        //save
                        tweet.save(function(err, tweet) {
                            if (err) return console.error(err)
                            console.log(tweet.candidate + " (" + tweet.created_at + ") scored " + tweet.sentiment + ": " + tweet.description);
                            console.log("");
                        });

                    }

                });
            }
        }

    })
};


app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== "test") {
        console.log(err)
    }
    res.status(500).send(err);
});

module.exports = app.listen(port, () => {
    console.log('Example app listening at http://localhost:' + port);
});
