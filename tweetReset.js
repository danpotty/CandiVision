"use strict";
let mongoose = require('mongoose');
require('./models/tweet');
let Tweet = mongoose.model('Tweet');

module.exports = function() {

    // Runs every 10 minutes and removes tweets older than 10 minutes
    function timer() {
        setInterval(function() {
            let timer = new Date(new Date().getTime() - (10 * 60 * 1000));
            console.log(timer);
            Tweet.remove({ created_at: { $lt: timer } }, (err, result) => {
                if(err) console.log(err);
                if(!result) return('Could not delete tweets older than 10 minutes.');
            });
            console.log('Tweet collection deleted');
        }, 10 * 60 * 1000);
    }
    timer();
};
