'use strict';
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let jwt = require("express-jwt");
let Comment = mongoose.model('Comment');
let User = mongoose.model('User');
let Candidate = mongoose.model('Candidate');
let auth = jwt({
  userProperty: 'payload',
  secret: process.env.JWTsecret
});

router.get('/:id', (req, res, next) => {
  Candidate.findOne({ _id: req.params.id })
  .populate('comments')
  .exec((err, result) => {
    if(err) return next(err);
    if(!result) return next('Could not find that candidate');
    res.send(result);
  });
});

router.post('/:id', auth, (req, res, next) => {
  let comment = new Comment(req.body);
  comment.user = req.payload._id;
  comment.candidate = req.params.id;
  comment.save((err, result) => {
    if(err) return next(err);
    if(!result) return next('Could not create that comment');
    User.update({ _id : req.payload.id }, { $push: { comments: result._id }}, (err, user) => {
      if(err) return next(err);
      Candidate.update({ _id : req.params.id }, { $push: { comments: result._id }}, (err, candidate) => {
        if(err) return next(err);
        res.send(result);
      });
    });
  });
});

router.delete('/:id', auth, (req, res, next) => {
  Comment.remove({ _id : req.params.id }, (err, result) => {
    if(err) return next(err);
    Candidate.findOneAndUpdate({ 'comments' : req.params.id }, { $pull : { comments : req.params.id }}, (err, result) => {
      if(err) return next(err);
      result.save();
      User.findOneAndUpdate({ 'comments' : req.params.id }, { $pull : { comments : req.params.id }}, (err, result) => {
        if(err) return next(err);
        res.send(result);
      });
    });
  });
});

router.put('/:id', auth, (req, res, next) => {
  if(!req.body.message) return next('Comment field is empty');
  Comment.update({ _id : req.params.id }, { message : req.body.message }, (err, result) => {
    if(err) return next(err);
    if(!result) return next('Comment not found');
    res.send(result);
  });
});

module.exports = router;
