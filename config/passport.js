    var models  = require('../models');
var LocalStrategy   = require('passport-local').Strategy;
// expose this function to our app using module.exports
module.exports = function(passport, logueados) {

    passport.serializeUser(function (user, done) {
        done(null, {
            id: user.id,
            type: user.type
        });
    });

    passport.deserializeUser(function (user, done) {
        switch (user.type) {
            case 'user':
                models.Participante.findById(user.id)
                    .then(function(usuario) {
                        done(null, usuario);
                    });
                break;
            case 'admin':
                models.Admin.findById(user.id)
                    .then(function(admin){
                        done(null, admin);
                    });
                break;
            default:
                req.flash('error', 'Tipo de usario no econtrado');
                done(null, false);
                break;
        }
    });

    passport.use('local-signup', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
        console.log(email, password, req.body.username);
            models.Participante.findAll({where: {email: email, registrado: true}})
                .then(function(result){
                    console.log(result);
                    if (result.length > 0){
                        req.flash('error', 'Error: no pudimos registrarte.');
                        return done(null, false);
                    } else {
                        models.Participante.destroy({
                            where: {
                                email: email
                            }
                        });
                        var newUserMysql = new Object();
                        newUserMysql.email = email;
                        newUserMysql.username = req.body.username;
                        newUserMysql.password = password;
                        newUserMysql.type = "user";
                        models.Participante.create({
                            username: req.body.username,
                            password: password,
                            email: email,
                            registrado: true
                        }).then(function (result) {
                            if (req.body.english == "true") req.flash('success', 'now you are registered!');
                            else req.flash('success', 'Ya estas registrado!');
                            console.log(result.id);
                            newUserMysql.id = result.id;
                            return done(null, newUserMysql);
                        });
                    }
                });
        }));

    passport.use('local-login', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            models.Participante.findAll({where: {email: email}})
                .then(function(result){
                    if(!result.length){
                        return done(null, false, req.flash('error', 'Usuario no encontrado.'));
                    } else if (!(result[0].password == password)){
                        return done(null, false, req.flash('error', 'Contraseña incorrecta.'));
                    } else {
                        if (req.body.english == "true") req.flash('success', 'You are now in your account!');
                        else req.flash('success', 'Ya estas en tu cuenta!');
                        var retorno = new Object();
                        retorno.id = result[0].id;
                        retorno.type = "user";
                        return done(null, retorno);
                    }
                });
        })
    );

    passport.use('local-login-admin', new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {
            models.Admin.findById(username)
                .then(function(result){
                    if(result == null){
                        return done(null, false, req.flash('error', 'Administrador no encontrado.'));
                    } else if (!(result.pass == password)){
                        return done(null, false, req.flash('error', 'Contraseña incorrecta.'));
                    } else {
                        req.flash('success', 'Ya estas en tu cuenta!');
                        var retorno = new Object();
                        retorno.id = result.username;
                        retorno.type = "admin";
                        return done(null, retorno);
                    }
                });
        })
    );
};