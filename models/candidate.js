"use strict";
let mongoose = require("mongoose");

let CandidateSchema = new mongoose.Schema({
	id: Number,
	name: String,
	sentiment: Number,
	favorRatingTotals: [],
	dailyRating: {
		posTweets: Number,
		totalTweets: Number
	},
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]

});

module.exports = mongoose.model("Candidate", CandidateSchema);
