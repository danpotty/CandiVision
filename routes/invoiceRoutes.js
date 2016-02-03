'use strict';
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let User = mongoose.model('User');
let Invoice = mongoose.model('Invoice');
let jwt = require('express-jwt');
let stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);
let auth = jwt({
  userProperty: 'payload',
  secret: process.env.JWTsecret
})

router.post('/charge', auth, (req, res, next) => {
  // console.log(req.body);
 stripe.charges.create({
    amount: req.body.amount,
    currency: 'usd',
    source: req.body.token,
    description: 'One time account upgrade for user # ' + req.payload._id
  }, function(err, charge) {
    // console.log('########charge#####');
    //   console.log(charge);
    //   console.log(err);
    if (charge){
      let invoice = new Invoice();
      invoice.completeChargeResponse = charge;
      invoice.user.email = req.email;
      invoice.user._id = req.payload._id;
      invoice.amount = req.body.amount;
      invoice.amount_refunded = charge.amount_refunded;
      invoice.chargeId = charge.id;
      invoice.description = charge.description;
      invoice.paid = charge.paid;
      invoice.createdBy = req.payload._id;
      invoice.save((err, result) => {
        
        // console.log('#########invoice#######');
        // console.log(invoice);

        if(err) return next(err);
        if(!result) return next('Could not create that charge');
      
        User.findOneAndUpdate({ _id: req.payload._id}, { premiumStatus: true, $push: { charges: result._id }}, (err, result) => {
          if (err) throw err;
          res.end();
        });
      });   
    }; if(err) return next(err);
  });
});

module.exports = router;