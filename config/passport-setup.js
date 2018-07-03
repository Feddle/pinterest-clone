require("dotenv").config();
const passport = require("passport");
const GithubStrategy = require("passport-github2").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const User = require("../models/user-model");

const callbackURL = process.env.ENVIRONMENT === "production" ? "https://book-club-feddle.glitch.me/auth/twitter/redirect" : "http://127.0.0.1:51335/auth/github/redirect";

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new LocalStrategy((username, password, done) => {              
        User.findOne({ username }, (err, user) => {                
            if (err) { return done(err); }
            if (!user) { return done(null, false, { message: "Authentication failed, please try again" }); }
            if (user.password != password) { return done(null, false, { message: "Authentication failed, please try again" }); }
            return done(null, user);
        });
    })
);

passport.use(
    new GithubStrategy({        
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL
    }, (accessToken, refreshToken, profile, done) => {           
        User.findOne({githubId: profile.id}).then((currentUser) => {
            if(currentUser){                
                done(null, currentUser);
            } else {                
                new User({
                    githubId: profile.id,
                    username: profile.username,
                    link: crypto.randomBytes(3).toString("hex")                    
                }).save().then((newUser) => {                    
                    done(null, newUser);
                });
            }
        });
    })
);
