/**
 * Created by famancil on 21-08-16.
 */
// config/passport.js
//var Usuario= require('./models/usuario');
//var Sequelize = require('sequelize');

var models  = require('../models');
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Mariobros1!'
});

connection.query('USE proyecto');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("select * from Participante where id = "+id,function(err,rows){
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            connection.query("select * from Participante where email = '"+email+"'",function(err,rows){
                console.log(rows);
                console.log("above row object");
                if (err) {
                    req.flash('error', 'e r r o r');
                    return done(err);
                }
                if (rows.length) {
                    req.flash('error_msg', 'that email is already t h i c c');
                    return done(null, false);
                } else {
                    var newUserMysql = new Object();
                    newUserMysql.email    = email;
                    newUserMysql.username    = req.body.username;
                    newUserMysql.password = password;
                    models.Participante.create({
                        username: req.body.username,
                        password: password,
                        email: email,
                        registrado: true
                    }).then(function (result) {
                        console.log(result);
                        req.flash('success_msg', 'all t h i c c');
                        newUserMysql.id = result.id;
                        return done(null, newUserMysql);
                    });
                }
            });
        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form

            connection.query("SELECT * FROM Participante WHERE email = '" + email + "'",function(err,rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!( rows[0].password == password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                req.flash('success_msg', 'all t h i c c');
                return done(null, rows[0]);

            });
        }));
};