/**
 * Created by famancil on 21-08-16.
 */
var Sesion = require('../controllers/Sesion');
var Escenario = require('../controllers/Escenario');
var Participante = require('../controllers/Participante');
var models  = require('../models');
var decrypt = require('../controllers/decrypt');
var encrypt = require('../controllers/encrypt');

module.exports = function(app, passport, nodemailer, crypto, timer2, listaSesiones) {

    app.get('/', function (req, res) {
        res.render('index');
    });
    //////////////////////////LOGIN///////////////////////////////////////
    app.get('/login', function(req, res) {
        res.render('login', { message: req.flash('loginMessage') });
    });

    app.get('/signup', function(req, res) {
        res.render('signup', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profiles.handlebars section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profiles', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    /////////////////////// DECISIONES //////////////////////////////////
    app.get('/decisiones', function(req, res, next) {
        models.Decision.findAll().then(function (decision) {
            res.render('decisiones', { message: req.flash('loginMessage'), dec: decision});
        });
    });

    app.post('/mandar_decisiones', function (req, res) {
        res.render('esperando_decision', {check: req.body.lang});
    });

    /////////////////////////// INICIALIZAR SESION //////////////////////////
    app.post('/inicializar_sesion', function (req, res) {
        new Promise(function(resolve,reject){
            sesion = new Sesion(req.body.titulo,req.body.descrip,null);
            sesion.crearSesion(resolve);
        }).then(function(data){
            sesion.id=data;
            listaSesiones[sesion.id]=sesion;
            res.redirect('/crear_sesion/'+encrypt(String(sesion.id),crypto));
        });
    });
    ///////////////////// CREAR SESION ///////////////////////////////////////
    app.get('/crear_sesion/:idSesionEnc', function (req, res) {
        res.render('sesion/crear_sesion', {
            sesion: listaSesiones[decrypt(req.params.idSesionEnc,crypto)],
            idSesionEnc: req.params.idSesionEnc
        });
    });

    app.post('/crear_sesion/invitar/:idSesionEnc', function(req, res) {
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        var errors = req.validationErrors();
        var repetido = false;
        var idSesion = decrypt(String(req.params.idSesionEnc),crypto);
        listaSesiones[idSesion].invitados.forEach(function(invitado) {
            if (invitado == req.body.email) {
                repetido = true;
                return;
            }
        });
        if (repetido) {
            res.render('sesion/crear_sesion', {
                sesion:listaSesiones[idSesion],
                repetido: true,
                idSesionEnc: req.params.idSesionEnc
            });
            return;
        }
        if (req.user) {
            if(req.user.email == req.body.email) {
                res.render('sesion/crear_sesion', {
                    errors: errors,
                    sesion: listaSesiones[idSesion],
                    propio: true,
                    idSesionEnc: req.params.idSesionEnc
                });
                return;
            }
        }
        if (!errors) {
            participante = new Participante(req.body.email);
            listaSesiones[idSesion].invitados.push(participante);
            console.log(listaSesiones[idSesion]);
        }
        res.render('sesion/crear_sesion', {
            errors: errors,
            sesion: listaSesiones[idSesion],
            idSesionEnc: req.params.idSesionEnc
        });
    });

    app.post('/crear_sesion/esc/:idSesionEnc', function(req, res) {
        req.checkBody('esc', 'escribe un objetivo').notEmpty();
        req.checkBody('hh', 'la hora debe ser un número entero').isInt();
        req.checkBody('mm', 'los minutos deben ser un número entero').isInt();
        req.checkBody('ss', 'los segundos deben ser un número entero').isInt();
        var errors = req.validationErrors();
        var idSesion = decrypt(String(req.params.idSesionEnc),crypto);
        if (!req.body.hh && !req.body.mm && !req.body.ss) {
            res.render('sesion/crear_sesion', {
                errors: errors,
                sesion: listaSesiones[idSesion],
                notiempo: true,
                idSesionEnc: req.params.idSesionEnc
            });
            return;
        }
        var repetido = false;
        listaSesiones[idSesion].escenarios.forEach(function(esc) {
            if (esc.objetivo == req.body.esc) {
                repetido = true;
                return;
            }
        });
        if (repetido) {
            res.render('sesion/crear_sesion', {
                errors: errors,
                sesion: listaSesiones[idSesion],
                escrepetido: true,
                idSesionEnc: req.params.idSesionEnc
            });
            return;
        }
        if (!errors) {
            new Promise(function(resolve,reject){
                esc = new Escenario(req.body.esc,req.body.hh,req.body.mm,req.body.ss,idSesion);
                esc.crearEscenario(resolve);
            }).then(function(data){
                esc.id=data;
                esc.crearSesionEsc();
                listaSesiones[idSesion].escenarios.push(esc);
                res.render('sesion/crear_sesion', {
                    errors: errors,
                    sesion: listaSesiones[idSesion],
                    idSesionEnc: req.params.idSesionEnc
                });
            });
            /*listaSesiones[idSesion].escenarios.push({
                esc: req.body.esc,
                hh: req.body.hh,
                mm: req.body.mm,
                ss: req.body.ss
            });
            timer2.hr = req.body.hh;
            timer2.min = req.body.mm;
            timer2.seg = req.body.ss;
            console.log(listaSesiones[idSesion]);*/
        } else {
            res.render('sesion/crear_sesion', {
                errors: errors,
                sesion: listaSesiones[idSesion],
                idSesionEnc: req.params.idSesionEnc
            });
        }
    });

    app.post('/crear_sesion/:idSesionEnc', function(req, res) {
        var idSesion = decrypt(String(req.params.idSesionEnc),crypto);
        if (listaSesiones[idSesion].invitados.length == 0 && listaSesiones[idSesion].escenarios.length == 0) {
            res.render('sesion/crear_sesion', {
                errors: errors,
                sesion: listaSesiones[idSesion],
                noinv: true,
                noesc: true,
                idSesionEnc: req.params.idSesionEnc
            });
            return;
        }
        else if (listaSesiones[idSesion].invitados.length == 0) {
            res.render('sesion/crear_sesion', {
                errors: errors,
                sesion: listaSesiones[idSesion],
                noinv: true,
                idSesionEnc: req.params.idSesionEnc
            });
            return;
        }
        else if (listaSesiones[idSesion].escenarios.length == 0) {
            res.render('sesion/crear_sesion', {
                errors: errors,
                sesion: listaSesiones[idSesion],
                noesc: true,
                idSesionEnc: req.params.idSesionEnc
            });
            return;
        }
        else {
            var smtpTransport = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                auth: {
                    user: "i.t.force.76@gmail.com",
                    pass: "mariobros1"
                }
            });

            listaSesiones[idSesion].invitados.forEach(function (invitado) {
                invitado.enviarEmail(smtpTransport,crypto,req.params.idSesionEnc,res);
            });

            return;
        }
    });

    ///////////////////////// PANTALLA USERNAME ////////////////////////////////
    app.get('/sesion/moderador/username/:idSesion/:emailInv', function (req, res){
        sesion.url = '/sesion/moderador/esperando/'+req.params.idSesion+ '/'+req.params.emailInv;
        sesion.activada = true;
        var idSesion = decrypt(req.params.idSesion,crypto);
        var emailInv = decrypt(req.params.emailInv,crypto);
        res.render('sesion/username', {
            idSesion: req.body.idSesion,
            emailInv: req.body.emailInv,
            idSesionEnc: req.params.idSesion,
            emailInvEnc: req.params.emailInv,
            creador: true
        });
    });


    app.get('/sesion/username/:idSesion/:emailInv', function (req, res){
        sesion.url = '/sesion/esperando/'+req.params.idSesion+ '/' + req.params.emailInv;
        sesion.activada = true;
        var idSesion = decrypt(req.params.idSesion,crypto);
        var emailInv = decrypt(req.params.emailInv,crypto);
        res.render('sesion/username', {
                idSesion: idSesion,
                emailInv: emailInv,
                idSesionEnc: req.params.idSesion,
                emailInvEnc: req.params.emailInv,
                creador: false
        });
    });
    /////////////////////// PANTALLA DE ESPERA ////////////////////////////////////
    app.get('/sesion/moderador/esperando/:idSesion/:emailInv', function(req, res) {
        var idSesion = decrypt(req.params.idSesion,crypto);
        var emailInv = decrypt(req.params.emailInv,crypto);
        var idEnc = encrypt(String(sesion.creador), crypto);
        require('../controllers/guardar_moderador')(req, sesion, idSesion, true);
        //res.redirect('/sesion/esperando/'+req.params.idSesion+'/'+req.params.emailInv);
        res.render('sesion/esperando', {
            username: req.user.username,
            emailInv: emailInv,
            idSesion: idSesion,
            creador: true,
            idSesionEnc: req.params.idSesion,
            emailInvEnc: req.params.emailInv,
            id: sesion.creador,
            idEnc: idEnc
        })
    });

    app.post('/sesion/moderador/esperando/:idSesion/:emailInv', function(req, res) {
        var idSesion = decrypt(req.params.idSesion,crypto);
        var emailInv = decrypt(req.params.emailInv,crypto);
        var idEnc = encrypt(String(sesion.creador), crypto);
        require('../controllers/guardar_moderador')(req, sesion, idSesion, false);
        //res.redirect('/sesion/esperando/'+req.params.idSesion+'/'+req.params.emailInv);
        res.render('sesion/esperando', {
            username: req.body.username,
            emailInv: emailInv,
            idSesion: idSesion,
            creador: true,
            idSesionEnc: req.params.idSesion,
            emailInvEnc: req.params.emailInv,
            id: sesion.creador,
            idEnc: idEnc
        })
    });

    app.get('/sesion/part/esperando/:idSesion/:emailInv', function(req, res) {
        var idSesion = decrypt(req.params.idSesion,crypto);
        var emailInv = decrypt(req.params.emailInv,crypto);
        var idEnc = encrypt(String(req.user.id), crypto);
        require('../controllers/guardar_registrado')(idSesion, req);
        //res.redirect('/sesion/esperando/'+req.params.idSesion+'/'+req.params.emailInv);
        res.render('sesion/esperando', {
            username: req.user.username,
            emailInv: emailInv,
            idSesion: idSesion,
            creador: false,
            idSesionEnc: req.params.idSesion,
            emailInvEnc: req.params.emailInv,
            id: req.user.id,
            idEnc: idEnc
        })
    });

    app.post('/sesion/part/esperando/:idSesion/:emailInv', function(req, res) {
        var idSesion = decrypt(req.params.idSesion,crypto);
        var emailInv = decrypt(req.params.emailInv,crypto);
        var id = require('../controllers/guardar_inv')(idSesion, emailInv, req.body.username);
        var idEnc = encrypt(String(id), crypto);
        //res.redirect('/sesion/esperando/'+req.params.idSesion+'/'+req.params.emailInv);
        res.render('sesion/esperando', {
            username: req.body.username,
            emailInv: emailInv,
            idSesion: idSesion,
            creador: false,
            idSesionEnc: req.params.idSesion,
            emailInvEnc: req.params.emailInv,
            id: id,
            idEnc: idEnc
        })
    });

    /*app.get('/sesion/esperando/:idSesion/:emailInv', function(req, res) {
        console.log("HOLAAAA");
    });*/

    /*app.get('/sesion/esperando/:idSesion/:emailInv', function(req, res){
        var idSesion = decrypt(req.params.idSesion,crypto);
        var emailInv = decrypt(req.params.emailInv,crypto);
        console.log(idSesion, emailInv, req.user.id);
        require('../controllers/guardar_registrado')(idSesion, req);
        models.Sesion.findAll({
            where: {
                id: req.params.idSesion
            }
        }).then(function(result) {
            sesion.creador = result.ParticipanteId;
            if (sesion.creador == req.user.id) {
                res.render('sesion/esperando', {
                    idSesion: idSesion,
                    emailInv: emailInv,
                    username: req.user.username,
                    id: req.user.id,
                    conectados: sesion.conectados,
                    idSesionEnc: req.params.idSesion,
                    idEnc: req.params.idSesion,
                    creador: true
                });
            } else {
                res.render('sesion/esperando', {
                    idSesion: idSesion,
                    emailInv: emailInv,
                    username: req.user.username,
                    id: req.user.id,
                    conectados: sesion.conectados,
                    idSesionEnc: req.params.idSesion,
                    idEnc: req.params.idSesion,
                    creador: false
                });
            }
        });
    });

    app.post('/sesion/esperando/:idSesion/:emailInv', function(req, res) {
        var id;
        require('../controllers/guardar_inv')(req.params.idSesion, req.params.emailInv,req.body.username, id);
        var idSesionEnc = encrypt(req.params.idSesion,crypto);
        var idEnc = encrypt(String(id),crypto);
        models.Sesion.findAll({
            where: {
                id: req.params.idSesion
            }
        }).then(function(result) {
            sesion.creador = result.ParticipanteId;
            if (sesion.creador == id) {
                res.render('sesion/esperando',
                    {
                        idSesion: req.params.idSesion,
                        emailInv: req.params.emailInv,
                        username: req.body.username,
                        conectados: sesion.conectados,
                        id: id,
                        idSesionEnc: idSesionEnc,
                        idEnc: idEnc,
                        creador: true
                    });
            } else {
                res.render('sesion/esperando',
                    {
                        idSesion: req.params.idSesion,
                        emailInv: req.params.emailInv,
                        username: req.body.username,
                        conectados: sesion.conectados,
                        id: id,
                        idSesionEnc: idSesionEnc,
                        idEnc: idEnc,
                        creador: false
                    });
            }
        });

    });*/
    ////////////////////////// ESCENARIOS //////////////////////////////////
    app.post('/sesion/iniciar/:idSesion/:id', function(req, res) {
        timer2.cont ++;
        var idSesion = decrypt(req.params.idSesion,crypto);
        var id = decrypt(req.params.id,crypto);
        //require('../controllers/iniciar')(idSesion, id)
        models.Sesion_esc.findAll({
            where: {
                SesionId: idSesion
            }
        }).then(function (escenarios) {
            sesion.esc = escenarios;
            models.Escenario.findAll({
                where: {
                    id: sesion.esc[0].id
                }
            }).then(function(esc) {
                console.log("ESCENARIOS", esc[0].dataValues);
                models.Decision.findAll().then(function (decision) {
                    res.render('decisiones',{
                        username: req.body.username,
                        idSesion: idSesion,
                        idSesionEnc: req.params.idSesion,
                        id: id,
                        idEnc: req.params.id,
                        dec: decision,
                        index: 0,
                        esc: esc[0].dataValues,
                        hor: timer2.hr,
                        mi: timer2.min,
                        se: timer2.seg,
                        n: timer2.cont
                    });

                });
            });
        });

    });

    app.post('/sesion/escenario/:idSesion/:id/:idEsc', function(req, res) {
        var index = parseInt(req.params.idEsc);
        if (index < sesion.esc.length) {
            models.Escenario.findAll({
                where: {
                    id: sesion.esc[index]
                }
            }).then(function(result) {
                console.log("dsFDSAFADSFSDA",result);
                res.render('decisiones', {
                    username: req.body.username,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesion,
                    emailInvEnc: req.params.emailInv,
                    id: id,
                    idEnc: req.params.id,
                    escenario: result,
                    dec: decision
                });
            });
        }
    });

    app.get('/usuarios', function (req, res) {
        timer=require('./controllers/timer');
        timer.mueveReloj(0,1,0);
        res.render('usuarios');
    });
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}