"use strict";
let mongoose = require('mongoose');
require('./models/candidate');
require('./models/tweet');
let Candidate = mongoose.model("Candidate");
let Tweet = mongoose.model('Tweet');

module.exports = function() {

  function timer() {
      console.log('database reset initiated');
      setInterval(function() {

        // -------------------------------------------------------
        // ---------------------BERNIE----------------------------
        // -------------------------------------------------------
        Candidate.findOne({ name: "Bernie Sanders" }, { 'dailyRating':1 }, (err, result) => {
          if (err) console.log(err);
          let posTweetsB = result.dailyRating.posTweets;
          let totalTweetsB = result.dailyRating.totalTweets;
          let bernieRating = { percentage : ((posTweetsB/totalTweetsB) * 100), total : totalTweetsB, date : (new Date().toJSON().slice(5,10))};

            Candidate.update({ name: "Bernie Sanders" }, { $push : { 'favorRatingTotals': bernieRating }}, (err, result) => {
              if (err) console.log(err);
              Candidate.update({ name: "Bernie Sanders" }, { $set : { 'dailyRating.totalTweets': 0 }}, (err, result) => {
                if (err) console.log(err);
              });
              Candidate.update({ name: "Bernie Sanders" }, { $set : { 'dailyRating.posTweets': 0 }}, (err, result) => {
                if (err) console.log(err);
              });
            });
          });

        // -------------------------------------------------------
        // ---------------------CLINTON---------------------------
        // -------------------------------------------------------
        Candidate.findOne({ name: "Hillary Clinton" }, { 'dailyRating':1 }, (err, result) => {
          if (err) console.log(err);
          let posTweetsC = result.dailyRating.posTweets;
          let totalTweetsC = result.dailyRating.totalTweets;
          let clintonRating = { percentage : ((posTweetsC/totalTweetsC) * 100), total : totalTweetsC, date : (new Date().toJSON().slice(5,10))};

            Candidate.update({ name: "Hillary Clinton" }, { $push : { 'favorRatingTotals': clintonRating }}, (err, result) => {
              if (err) console.log(err);
              Candidate.update({ name: "Hillary Clinton" }, { $set : { 'dailyRating.totalTweets': 0 }}, (err, result) => {
                if (err) console.log(err);
              });
              Candidate.update({ name: "Hillary Clinton" }, { $set : { 'dailyRating.posTweets': 0 }}, (err, result) => {
                if (err) console.log(err);
              });
            });
          });


        // -------------------------------------------------------
        // ----------------------TRUMP----------------------------
        // -------------------------------------------------------
        Candidate.findOne({ name: "Donald Trump" }, { 'dailyRating':1 }, (err, result) => {
          if (err) console.log(err);
          let posTweetsT = result.dailyRating.posTweets;
          let totalTweetsT = result.dailyRating.totalTweets;
          let trumpRating = { percentage : ((posTweetsT/totalTweetsT) * 100), total : totalTweetsT, date : (new Date().toJSON().slice(5,10))};

            Candidate.update({ name: "Donald Trump" }, { $push : { 'favorRatingTotals': trumpRating }}, (err, result) => {
              if (err) console.log(err);
              Candidate.update({ name: "Donald Trump" }, { $set : { 'dailyRating.totalTweets': 0 }}, (err, result) => {
                if (err) console.log(err);
              });
              Candidate.update({ name: "Donald Trump" }, { $set : { 'dailyRating.posTweets': 0 }}, (err, result) => {
                if (err) console.log(err);
              });
            });
          });


          // -------------------------------------------------------
          // ----------------------RUBIO----------------------------
          // -------------------------------------------------------
          Candidate.findOne({ name: "Marco Rubio" }, { 'dailyRating':1 }, (err, result) => {
            if (err) console.log(err);
            let posTweetsR = result.dailyRating.posTweets;
            let totalTweetsR = result.dailyRating.totalTweets;
            let rubioRating = { percentage : ((posTweetsR/totalTweetsR) * 100), total : totalTweetsR, date : (new Date().toJSON().slice(5,10))};

              Candidate.update({ name: "Marco Rubio" }, { $push : { 'favorRatingTotals': rubioRating }}, (err, result) => {
                if (err) console.log(err);
                Candidate.update({ name: "Marco Rubio" }, { $set : { 'dailyRating.totalTweets': 0 }}, (err, result) => {
                  if (err) console.log(err);
                });
                Candidate.update({ name: "Marco Rubio" }, { $set : { 'dailyRating.posTweets': 0 }}, (err, result) => {
                  if (err) console.log(err);
                });
              });
            });


        // -------------------------------------------------------
        // ----------------------TWEETS---------------------------
        // -------------------------------------------------------
        let ten = new Date(new Date().getTime() - (10 * 60 * 1000));
        Tweet.remove({ created_at: { $lt: ten } }, (err, result) => {
            if(err) console.log(err);
            if(!result) return('Could not delete tweets older than 10 minutes.');
        });
        console.log('Tweet collection deleted');
      }, 43200000);

  }

  timer();

};
