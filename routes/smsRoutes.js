'use strict';
let express = require('express');
let mongoose = require("mongoose");
let router = express.Router();
let twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
let User = mongoose.model("User");
let phoneReset = {};


// POST /api/v1/sms/receiveCode/
router.post('/receiveCode', (req, res, next) => {
    console.log(req.body);
    User.findOne({
        "emailRegis.phoneNumber": phoneScrub(req.body.phoneNumber)
    }).exec((error, userPhone) => {
        if (error) return next(error);
        if (!userPhone) return next("This phone number does not exist in our database");
        //Setting code && phoneReset obj
        var code = Math.trunc((Math.random().toFixed(6)) * 100000);
        phoneReset[phoneScrub(req.body.phoneNumber)] = code
        twilio.sendMessage({
            to: phoneScrub(req.body.phoneNumber),
            from: process.env.TWILIO_PHONE_NUMBER,
            body: "Your password reset code is: " + code
        }, function(err, generatedCode) {
            if (err) return next(err);
            if (!generatedCode) return next('Unable to send the text. Please try again.');
            res.send("success");
        });
    });
});


// POST /api/v1/sms/send/
router.post('/send', (req, res, next) => {
    if (!req.body || !req.body.firstName || !req.body.phoneNumber || !req.body.message)
        return next('Please include your first name, phone number and message.');
    twilio.sendMessage({
        to: process.env.ALEX_PHONE_NUMBER,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: 'Message from ' + req.body.firstName + ' at ' + req.body.phoneNumber + ': ' + req.body.message
    }, (err, sentSMS) => {
        if (err) return next(err);
        if (!sentSMS) return next('Unable to send the text. Please try again.');
        twilio.sendMessage({
            to: phoneScrub(req.body.phoneNumber),
            from: process.env.TWILIO_PHONE_NUMBER,
            body: 'Hi, ' + req.body.firstName + '! Your message was successfully sent!'
        }, (err, confirmSMS) => {
            if (err) return next(err);
            if (!confirmSMS) return next('Unable to confirm delivery of your text.')
            res.send("success");
        });
    });
});

router.post("/validate", (req, res, next) => {
    if(!phoneReset[phoneScrub(req.body.phoneNumber)]) 
        return next("Your phone number does not exist");
    if(phoneReset[phoneScrub(req.body.phoneNumber)] != req.body.number)
        return next("Invalid code");
    User.findOne({ "emailRegis.phoneNumber" : phoneScrub(req.body.phoneNumber) }).exec((err, user) => {
        if(err) return next(err);
        if(!user) return next("Could not find your phone number in our database");
        user.CreateHash(req.body.password, function(err, hash){
            user.emailRegis.password = hash;
            user.save();
            res.send("success");
        });
    });
});


function phoneScrub(str) {
    str = str.toString().replace(/[^\d]/g, '');
    str = '+1' + str;
    return str;
}

module.exports = router;
