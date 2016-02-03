"use strict";
let express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
let passport = require("passport");
let User = mongoose.model("User");
let jwt = require("express-jwt");
let GOOGLE_SCOPES = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];
let stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);
let auth = jwt({
    userProperty: 'payload',
    secret: process.env.JWTsecret
})

router.get("/auth/facebook", passport.authenticate("facebook", {
    scope: ['email']
}));

router.get("/auth/facebook/callback",
    passport.authenticate("facebook"), (req, res) => {
        if (req.newAccount) {
            return res.redirect(`/welcome?code=${req.user.generateJWT()}`);
        }
        res.redirect(`/?code=${req.user.generateJWT()}`);
    });

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
        failureRedirect: '/Login'
    }), (req, res) => {
        res.redirect('/?code=' + req.user.generateJWT());
    });

router.get('/auth/google',
    passport.authenticate('google', {
        scope: GOOGLE_SCOPES.join(" ")
    }));

router.get("/auth/google/callback",
    passport.authenticate("google"), (req, res) => {
        if (req.newAccount) {
            return res.redirect(`/welcome?code=${req.user.generateJWT()}`);
        }
        res.redirect(`/?code=${req.user.generateJWT()}`);
    });

router.post('/register', (req, res, next) => {
    console.log('req:');
    console.log(req.body);
    let user = new User();
    user.emailRegis.userName = req.body.username;
    user.emailRegis.email = req.body.email;
    user.emailRegis.name = req.body.name;
    if(req.body.phoneNumber){
      user.emailRegis.phoneNumber = phoneScrub(req.body.phoneNumber);
    }
    user.CreateHash(req.body.password, (err, hash) => {
        if (err) return next(err);
        user.emailRegis.password = hash;
        user.save((err, result) => {
            console.log('result:');
            console.log(result);
            if (err) return next(err);
            if (!result) return next('Error creating user');
            res.send({
                token: result.generateJWT()
            });
        });
    });
});

router.post('/login', (req, res, next) => {
    console.log('hitting login route')
    passport.authenticate('local', (err, user) => {
        if (err) return next(err);
        res.send({
            token: user.generateJWT()
        });
    })(req, res, next);
});

router.post('/resetPassword', (req, res, next) => {
    if (req.body.email != "") {
        User.findOne({
            "emailRegis.email": req.body.email
        }).exec((error, user) => {
            user.CreateHash(req.body.password, (error, hash) => {
                if (error) return next(error);
                user.emailRegis.password = hash;
                user.save((error, result) => {
                    if (error) return next(error);
                    res.send();
                });
            });
        });
    }
    if (req.body.phone != "") {
        User.findOne({
            "emailRegis.phoneNumber": req.body.phone
        }).exec((error, user) => {
            if (error) return next(error);
            user.CreateHash(req.body.password, (error, hash) => {
                if (error) return next(error);
                user.emailRegis.password = hash;
                user.save((error, result) => {
                    if (error) return next(error);
                    res.send();
                });
            });
        });
    }
});



router.post('/registeredPhone', (req, res, next) => {
    User.findOne({
        "emailRegis.phoneNumber": req.body.phone
    }).exec((error, user) => {
        if (error) return next(error);
        if (user != null) {
            res.send(true);
        } else {
            res.send(false);
        }
    });
});

router.post('/registeredEmail', (req, res, next) => {
    User.findOne({
        "emailRegis.email": req.body.email
    }).exec((error, user) => {
        if (error) return next(error);
        if (user != null) {
            res.send(true);
        } else {
            res.send(false);
        }
    });
});

function phoneScrub(str) {
    str = str.toString().replace(/[^\d]/g, '');
    str = '+1' + str;
    return str;
}


module.exports = router;
