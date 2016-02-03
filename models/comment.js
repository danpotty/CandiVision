"use strict";
let mongoose = require("mongoose");

let CommentSchema = new mongoose.Schema({
	user : { type : mongoose.Schema.Types.ObjectId, ref: "User" },
	candidate: { type : mongoose.Schema.Types.ObjectId, ref: "Candidate"},
	message: String,
	dateCreated: { type : Date, default: Date.now }

});

module.exports = mongoose.model("Comment", CommentSchema);