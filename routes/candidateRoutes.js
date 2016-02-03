'use strict';
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let jwt = require("express-jwt");
let Candidate = mongoose.model('Candidate');
let Comment = mongoose.model('Comment');
let User = mongoose.model('User');
let auth = jwt({
  userProperty: 'payload',
  secret: process.env.JWTsecret
});

router.get('/', (req, res, next) => {
  Candidate.find({})
  .populate('name', 'sentiment', 'dateCreated')
  .exec((err, result) => {
    if (err) return next(err);
    res.send(result);
  });
});

router.get('/presidential', (req, res, next) => {
  Candidate.find({ $or: [ { name: 'Bernie Sanders' }, { name: 'Hillary Clinton' }, { name: 'Donald Trump' }, { name: 'Marco Rubio' } ] }).exec((err, result) => {
    if(err) return next(err);
    if(!result) return('Could not find presidential candidates.');
    res.send(result);
  });
});

router.get('/:id', (req, res, next) => {
  Candidate.findOne({ _id: req.params.id }).exec((err, result) => {
    if(err) return next(err);
    if(!result) return('Could not find candidate.');
    res.send(result);
  });
});

router.post('/', auth, (req, res, next) => {
  if (req.payload.premiumStatus === false) return next('You must register for a premium account');
  let candidate = new Candidate(req.body);
  candidate.name = req.body.name;
  candidate.user = req.payload._id;
  candidate.save((err, result) => {
    if(err) return next(err);
    if(!result) return next('Could not add that person');
    User.update({ _id : req.payload._id }, { $push: { candidates : result._id }}, (err, user) => {
      if(err) return next(err);
      if(!user) return next('Could add candidate to user object');
      res.send(result);
    });
  });
});

router.delete('/:id', (req, res, next) => {
  Candidate.remove({ _id : req.params.id }, (err, result) => {
    if(err) return next('Could not delete that candidate');
    User.findOneAndUpdate({ 'candidates': req.params.id}, { $pull: { candidates: req.params.id }}, (err, result) => {
      if(err) return next(err);
      res.send(result);
    });
  });
});

router.put('/:id', (req, res, next) => {
  //Use this for adding hashtags?
  Candidate.update({ _id : req.params.id }, req.body, (err, result) => {
    if(err) return next('Could not update candidate');
    if(!result) return next('Candidate not found');
    res.send(result);
  });
});

module.exports = router;
