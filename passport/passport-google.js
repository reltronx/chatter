'use strict';

const mongoose = require('mongoose');
const passport = require('passport');
const User = require('../models/user');
// const secret = require('../secrets/secretFile');
const secret = {
    facebook: {
        clientID:'139347173422628',
        clientSecret: '305904d99e04c0e79dcf69242fb06404',
       

    },

    google: {
        clientID: '350979007673-5mu3dotu22vn6jalvppvn2hl4ibira88.apps.googleusercontent.com',
        clientSecret: 'D7MwPXWnhgy8uA2f92hJDHwQ',
    }
}
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({

    clientID: secret.google.clientID,
    clientSecret: secret.google.clientSecret,
    callbackURL: 'http://localhost:3000/auth/google/callback',
    passReqToCallback: true,
    },
    (req, accessToken, refreshToken, profile, done)=>{

        
        User.findOne({'google':profile.id}, (err, user) => {
            if(err){
               return done(err);
            }
            
            
            if(user){ 
                return done(null,user);
            }
            else{
                const newUser = new User();
                newUser.username = profile.displayName;
                newUser.google = profile.id;
                newUser.fullname = profile.displayName ;
                newUser.email = profile.emails[0].value; 
                newUser.userImage = profile._json.image.url;

             

    
                newUser.save((err,user)=>{
    
                    if(err) return console.log(err);
                    return done(null,user);
                })
    
            }
        });
    }));
            

    
