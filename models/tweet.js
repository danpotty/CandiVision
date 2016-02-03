"use strict";
let mongoose = require("mongoose");

let TweetSchema = mongoose.Schema({
	candidate: String,
    user : String,
    description : String,
	sentiment: Number,
    created_at : Date
});

module.exports = mongoose.model("Tweet", TweetSchema);
