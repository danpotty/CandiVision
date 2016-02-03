'use strict';
let express = require("express");
let mongoose = require("mongoose");
let router = express.Router();
let nodemailer = require("nodemailer");
let User = mongoose.model("User");
let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_FROM_USER,
        pass: process.env.EMAIL_FROM_PASSWORD
    }
});
let emailReset = {};

router.post('/receiveCode', (req, res, next) => {
    console.log(req.body);
    User.findOne({
        "emailRegis.email": req.body.email
    }).exec((error, userEmail) => {
        if (error) return next(error);
        if (!userEmail) return next("This email does not exist in our database");
        //Setting code && phoneReset obj
        var code = Math.trunc((Math.random().toFixed(6)) * 100000);
        emailReset[req.body.email] = code;
        transporter.sendMail({
            from: process.env.EMAIL_FROM_USER,
            to: req.body.email,
            subject: "Your password reset code",
            html: 'Your password reset code is: ' + code
        });
        res.send("SUCCESS");
    });

});

router.post('/send', (req, res, next) => {
    var data = req.body;
    transporter.sendMail({
        from: data.contactEmail,
        to: process.env.EMAIL_TO_USER,
        subject: 'Message from ' + data.contactName,
        html: data.contactMsg
    });
    res.send(data);
});

router.post("/validate", (req, res, next) => {
    if(!emailReset[req.body.email]) 
        return next("Your email does not exist");
    if(emailReset[req.body.email] != req.body.number)
        return next("Invalid code");
    User.findOne({ "emailRegis.email" : req.body.email }).exec((err, user) => {
        if(err) return next(err);
        if(!user) return next("Could not find your email in our database");
        user.CreateHash(req.body.password, function(err, hash){
            user.emailRegis.password = hash;
            user.save();
            res.send("success");
        });
    });
});


// router.post('/sendCode', (req, res, next) => {
//     var data = req.body;
//     var codeString = data.generatedCode.toString();
//     transporter.sendMail({
//         from: process.env.EMAIL_FROM_USER,
//         to: req.body.email,
//         subject: 'Password reset code',
//         html: codeString
//     });
//     res.send(data);
// });

module.exports = router;
