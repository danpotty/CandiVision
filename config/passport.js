"use strict";
let passport = require("passport");
let LocalStrategy = require("passport-local").Strategy;
let FacebookStrategy = require("passport-facebook").Strategy;
let TwitterStrategy = require("passport-twitter").Strategy;
let GoogleStrategy = require("passport-google-oauth2").Strategy;
let mongoose = require("mongoose");
let User = mongoose.model("User");
let request = require("request");

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(new LocalStrategy({
    usernameField: "email"
}, (email, password, done) => {
    User.findOne({
        "emailRegis.email": email
    }, (err, user) => {
        if (err) return done(err);
        if (!user) return done(`Cannot find this user`);
        user.validatePassword(password, user.emailRegis.password, (err, isMatch) => {
            if (err) return done(err);
            if (!isMatch) return done(`Incorrect login information`);
            return done(null, user);
        });
    });
}));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_RETURN_URL,
    profileFields: ["emails", "name", "id"],
    enableProof: false,
    passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
    User.findOne({
        'facebook.id': profile.id
    }.exec, (err, user) => {
        if (err) return done(err)
        if (user) {
            req.user = user;
            return done(null, user);
        } else {
            let user = new User();
            // user.email = profile.emails[0].value;
            user.facebook.id = profile.id;
            user.facebook.token = accessToken;
            user.facebook.email = profile.emails[0].value;
            user.facebook.name = profile.name.givenName + " " + profile.name.familyName;
            user.save((err, user) => {
                if (err) return done(err);
                req.user = user;
                req.newAccount = true;
                return done(null, user);
            })
        }
    });
}));

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_RETURN_URL,
    profileFields: ["name", "screen_name"],
    passReqToCallback: true
}, (req, token, tokenSecret, profile, done) => {
    process.nextTick(() => {
        User.findOne({
            'twitter.id': profile.id
        }, (err, user) => {
            if (err) return done(err);
            if (user) {
                req.user = user;
                return done(null, user);
            } else {
                var user = new User();
                user.twitter.id = profile.id;
                user.twitter.token = token;
                // user.twitter.name = profile.name[0] + " " + profile.name[1];
                user.twitter.displayName = profile.displayName;
                user.save((err, user) => {
                    if (err) return done(err);
                    req.user = user;
                    req.newAccount = true;
                    return done(null, user);
                })
            }
        });
    });
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_RETURN_URL,
  passReqToCallback: true
}, (req, token, refreshToken, profile, done) => {
  process.nextTick(() => {
    User.findOne({
      "google.id" : profile.id
    }, (err, user) => {
      if(err) return done(err);
      if(user) {
        req.user = user;
        return done(null, user);
      }
      else {
        var user = new User();
        // user.email = profile.emails[0].value;
        user.google.id = profile.id;
        user.google.token = token;
        user.google.name = profile.displayName;
        user.google.email = profile.emails[0].value;
        user.save((err, user) => {
          if(err) return done(err);
          req.user = user;
          req.newAccount = true;
          return done(null, user);
        });
      }
    });
  });
}));
