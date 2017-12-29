var Sesion = require('../controllers/Sesion');
var Escenario = require('../controllers/Escenario');
var Invitado = require('../controllers/Invitado');
var Participante = require('../controllers/Participante');
var models  = require('../models');
var decrypt = require('../controllers/decrypt');
var encrypt = require('../controllers/encrypt');

module.exports = function(app, passport, nodemailer, crypto, listaSesiones, listaDecisiones){

    app.get('/', function (req, res) {
        res.render('index.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });
    app.post('/', function (req, res) {
        res.render('index.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.get('/en', function (req, res) {
        res.render('index_en.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });
    app.post('/en', function (req, res) {
        res.render('index_en.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.get('/layout', function(res) {
        res.render('layout.html');
    });
    //////////////////////////LOGIN///////////////////////////////////////

    app.get('/login', function (req, res) {
        res.render('login.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.get('/login_en', function (req, res) {
        res.render('login_en.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.post('/login_en', function (req, res) {
        res.render('login_en.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/loginAdmin', function(req, res) {
        res.render('loginAdmin.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.post('/loginAdmin', passport.authenticate('local-login-admin', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/loginAdmin', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/loginAdmin_en', function(req, res) {
        res.render('loginAdmin_en.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.post('/loginAdmin_en', function(req, res) {
        res.render('loginAdmin_en.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.get('/registro', function (req, res) {
        res.render('registro.html', {success: req.flash('success'),
            error: req.flash('error')});
    });

    app.post('/registro', passport.authenticate('local-signup', {
        successRedirect: '/', // redirect to the secure profiles.handlebars section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));


    app.get('/sign_in', function (req, res) {
        res.render('registro_en.html', {success: req.flash('success'),
            error: req.flash('error')});
    });

    app.post('/sign_in', function (req, res) {
        res.render('registro_en.html', {success: req.flash('success'),
            error: req.flash('error')});
    });

    app.get('/logout', function (req, res) {
        //delete logueados[req.user.id];
        req.logout();
        res.redirect('/');
    });
    

    /////////////////////////// INICIALIZAR SESION //////////////////////////
    app.post('/inicializar_sesion', function (req, res) {
        req.checkBody('titulo', 'El título es obligatorio').notEmpty();
        req.checkBody('descrip', 'La descripción es obligatoria').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.render('index.html', {errors: errors, titulo: req.body.titulo, descrip: req.body.descrip});
        } else {
            new Promise(function (resolve, reject) {
                sesion = new Sesion(req.body.titulo, req.body.descrip, null);
                sesion.crearSesion(resolve);
            }).then(function (data) {
                sesion.id = data;
                listaSesiones[sesion.id] = sesion;
                if (req.body.english == "true") {
                    res.redirect('/crear_sesion_en/' + encrypt(String(sesion.id), crypto));
                }
                else
                res.redirect('/crear_sesion/' + encrypt(String(sesion.id), crypto));
            });
        }
    });
    ///////////////////// CREAR SESION ///////////////////////////////////////
    app.get('/crear_sesion/:idSesionEnc', function (req, res) {
        res.render('crearSesion.html', {
            sesion: listaSesiones[parseInt(decrypt(req.params.idSesionEnc, crypto))],
            idSesionEnc: req.params.idSesionEnc,
            en: false
        });
    });

    app.get('/crear_sesion_en/:idSesionEnc', function (req, res) {
        var en = req.body.english;
        if (req.body.english == undefined) en = true;
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        res.render('crearSesion.html', {
            sesion: listaSesiones[parseInt(decrypt(req.params.idSesionEnc, crypto))],
            idSesionEnc: req.params.idSesionEnc,
            en: en
        });
    });

    app.post('/crear_sesion_en/:idSesionEnc', function (req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        res.render('crearSesion.html', {
            sesion: listaSesiones[parseInt(decrypt(req.params.idSesionEnc, crypto))],
            idSesionEnc: req.params.idSesionEnc,
            en: req.body.english
        });
    });


    ///////////// CREAR SESION + ENVIAR INV + AGREGAR ESC//////////////
    app.post('/crear_sesion/:idSesionEnc', function (req, res) {
        console.log(req.body.invitados);
        console.log(req.body.escenarios);
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        JSON.parse(req.body.invitados).forEach(function(invitado){
            invitado = new Invitado(invitado);
            listaSesiones[idSesion].invitados.push(invitado);
        });
        JSON.parse(req.body.escenarios).forEach(function(esc) {
            new Promise(function (resolve) {
                esc = new Escenario(esc.obj, esc.hh, esc.mm, esc.ss, idSesion);
                esc.crearEscenario(resolve);
            }).then(function (data) {
                esc.id = data;
                esc.crearSesionEsc();
                listaSesiones[idSesion].escenarios.push(esc);
            });
        });

        var smtpTransport = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            auth: {
                user: "i.t.force.76@gmail.com",
                pass: "mariobros1"
            }
        });

        listaSesiones[idSesion].invitados.forEach(function (invitado) {
            invitado.enviarEmail(smtpTransport, crypto, req.params.idSesionEnc, res);
        });
        if (req.body.english == "true") res.redirect('/sesion/moderador/username_en/'
            + req.params.idSesionEnc + '/'
            + encrypt(String(listaSesiones[idSesion].creador), crypto)
        );
        else
        res.redirect('/sesion/moderador/username/'
            + req.params.idSesionEnc + '/'
            + encrypt(String(listaSesiones[idSesion].creador), crypto)
        );
    });

    ///////////////////////// PANTALLA USERNAME ////////////////////////////////
    app.get('/sesion/moderador/username/:idSesionEnc/:emailInvEnc', function (req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        var emailInv = decrypt(req.params.emailInvEnc, crypto);
        var moderador_guardado = false;
        listaSesiones[idSesion].url = '/sesion/mod/iniciando/' + req.params.idSesionEnc + '/' + req.params.emailInvEnc;
        for (j = 0; j < listaSesiones[idSesion].participantes.length; j++){
            if (listaSesiones[idSesion].participantes[j].id === listaSesiones[idSesion].moderador) {
                moderador_guardado = true;
                break;
            }
        }
        if (req.isAuthenticated()) {
            //logueados[req.user.id].enSesion = true;
            //logueados[req.user.id].idSesion = idSesion;
            if (!moderador_guardado) {
                var part = new Participante(req.user.email, req.user.username, req.user.password, true);
                part.id = req.user.id;
                part.crearSesionUser(idSesion);
                part.guardarModerador(idSesion);
                listaSesiones[idSesion].moderador = part.id;
                listaSesiones[idSesion].participantes.push(part);
                listaSesiones[idSesion].conectados.push(part);
                console.log("estoy en username del mod en get en logueado: ", listaSesiones[idSesion].participantes);
                res.render('esperando.html', {
                    names: [],
                    noresultado: true,
                    username: req.user.username,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesionEnc,
                    creador: true,
                    idPart: req.user.id,
                    idPartEnc: encrypt(String(req.user.id), crypto),
                    indexEsc: 0,
                    inicio: listaSesiones[idSesion].inicio,
                    revisados: [],
                    emailInv: emailInv,
                    en: req.body.english
                });
            }   else    { //si ya esta guardado el moderador
                console.log("estoy en username del mod en get en logueado: ", listaSesiones[idSesion].participantes);
                res.render('esperando.html', {
                    names: [],
                    noresultado: true,
                    username: req.user.username,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesionEnc,
                    creador: true,
                    idPart: req.user.id,
                    idPartEnc: encrypt(String(req.user.id), crypto),
                    indexEsc: 0,
                    inicio: listaSesiones[idSesion].inicio,
                    revisados: [],
                    emailInv: emailInv,
                    en: req.body.english
                });
            }
        } else {
            console.log("estoy en username del mod en get sin loguear: ", listaSesiones[idSesion].participantes);
            res.render('username.html', {
                idSesion: idSesion,
                emailInv: emailInv,
                idSesionEnc: req.params.idSesionEnc,
                emailInvEnc: req.params.emailInvEnc,
                creador: true,
                en: req.body.english
            });
        }
    });

    app.get('/sesion/moderador/username_en/:idSesionEnc/:emailInvEnc', function (req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        var emailInv = decrypt(req.params.emailInvEnc, crypto);
        var moderador_guardado = false;
        listaSesiones[idSesion].url = '/sesion/mod/iniciando/' + req.params.idSesionEnc + '/' + req.params.emailInvEnc;
        for (j = 0; j < listaSesiones[idSesion].participantes.length; j++){
            if (listaSesiones[idSesion].participantes[j].id === listaSesiones[idSesion].moderador) {
                moderador_guardado = true;
                break;
            }
        }
        if (req.isAuthenticated()) {
            //logueados[req.user.id].enSesion = true;
            //logueados[req.user.id].idSesion = idSesion;
            if (!moderador_guardado) {
                var part = new Participante(req.user.email, req.user.username, req.user.password, true);
                part.id = req.user.id;
                part.crearSesionUser(idSesion);
                part.guardarModerador(idSesion);
                listaSesiones[idSesion].moderador = part.id;
                listaSesiones[idSesion].participantes.push(part);
                listaSesiones[idSesion].conectados.push(part);
                console.log("estoy en username del mod en get en logueado: ", listaSesiones[idSesion].participantes);
                res.render('esperando.html', {
                    names: [],
                    noresultado: true,
                    username: req.user.username,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesionEnc,
                    creador: true,
                    idPart: req.user.id,
                    idPartEnc: encrypt(String(req.user.id), crypto),
                    indexEsc: 0,
                    inicio: listaSesiones[idSesion].inicio,
                    revisados: [],
                    emailInv: emailInv,
                    en: true
                });
            }   else    { //si ya esta guardado el moderador
                console.log("estoy en username del mod en get en logueado: ", listaSesiones[idSesion].participantes);
                res.render('esperando.html', {
                    names: [],
                    noresultado: true,
                    username: req.user.username,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesionEnc,
                    creador: true,
                    idPart: req.user.id,
                    idPartEnc: encrypt(String(req.user.id), crypto),
                    indexEsc: 0,
                    inicio: listaSesiones[idSesion].inicio,
                    revisados: [],
                    emailInv: emailInv,
                    en: true
                });
            }
        } else {
            console.log("estoy en username del mod en get sin loguear: ", listaSesiones[idSesion].participantes);
            res.render('username.html', {
                idSesion: idSesion,
                emailInv: emailInv,
                idSesionEnc: req.params.idSesionEnc,
                emailInvEnc: req.params.emailInvEnc,
                creador: true,
                en: true
            });
        }
    });

    app.post('/sesion/moderador/username/:idSesionEnc/:emailInvEnc', function (req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        var emailInv = decrypt(req.params.emailInvEnc, crypto);
        var moderador_guardado = false;
        //if (req.body.english == "true") listaSesiones[idSesion].english = true;
        //else listaSesiones[idSesion].english = false;
        listaSesiones[idSesion].url = '/sesion/mod/iniciando/' + req.params.idSesionEnc + '/' + req.params.emailInvEnc;
        for (j = 0; j < listaSesiones[idSesion].participantes.length; j++){
            if (listaSesiones[idSesion].participantes[j].id === listaSesiones[idSesion].moderador) {
                moderador_guardado = true;
                break;
            }
        }
        if (req.isAuthenticated()) {
            //logueados[req.user.id].enSesion = true;
            //logueados[req.user.id].idSesion = idSesion;
            if (!moderador_guardado) {
                var part = new Participante(req.user.email, req.user.username, req.user.password, true);
                part.id = req.user.id;
                part.crearSesionUser(idSesion);
                part.guardarModerador(idSesion);
                listaSesiones[idSesion].moderador = part.id;
                listaSesiones[idSesion].participantes.push(part);
                listaSesiones[idSesion].conectados.push(part);
                console.log("estoy en username del mod en post en logueado: ", listaSesiones[idSesion].participantes);
                res.render('esperando.html', {
                    names: [],
                    noresultado: true,
                    username: req.user.username,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesionEnc,
                    creador: true,
                    idPart: req.user.id,
                    idPartEnc: encrypt(String(req.user.id), crypto),
                    indexEsc: 0,
                    inicio: listaSesiones[idSesion].inicio,
                    revisados: [],
                    emailInv: emailInv,
                    en: req.body.english
                });
            }   else    { //si ya esta guardado el moderador
                console.log("estoy en username del mod en post en logueado: ", listaSesiones[idSesion].participantes);
                res.render('esperando.html', {
                    names: [],
                    noresultado: true,
                    username: req.user.username,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesionEnc,
                    creador: true,
                    idPart: req.user.id,
                    idPartEnc: encrypt(String(req.user.id), crypto),
                    indexEsc: 0,
                    inicio: listaSesiones[idSesion].inicio,
                    revisados: [],
                    emailInv: emailInv,
                    en: req.body.english
                });
            }
        } else {
            console.log("estoy en username del mod en post sin loguear: ", listaSesiones[idSesion].participantes);
            res.render('username.html', {
                idSesion: idSesion,
                emailInv: emailInv,
                idSesionEnc: req.params.idSesionEnc,
                emailInvEnc: req.params.emailInvEnc,
                creador: true,
                en: req.body.english
            });
        }
    });

    app.get('/sesion/username/:idSesionEnc/:emailInvEnc', function (req, res) {
        var idSesion = parseInt(decrypt(req.params.idSesionEnc, crypto));
        var emailInv = decrypt(req.params.emailInvEnc, crypto);
        //listaSesiones[idSesion].url = '/sesion/esperando/' + req.params.idSesion + '/' + req.params.emailInv;
        var bool = true;
        if (req.isAuthenticated()) {
            //logueados[req.user.id].enSesion = true;
            //logueados[req.user.id].idSesion = idSesion;
            console.log("estoy en username del part en get en logueado: ", listaSesiones[idSesion].participantes);
            for (i = 0; i < listaSesiones[idSesion].participantes.length; i++){
                if (String(listaSesiones[idSesion].participantes[i].email) === String(emailInv)) {
                    res.render('esperando.html', {
                        names: [],
                        noresultado: true,
                        username: req.user.username,
                        idSesion: idSesion,
                        idSesionEnc: req.params.idSesionEnc,
                        creador: false,
                        idPart: req.user.id,
                        idPartEnc: encrypt(String(req.user.id), crypto),
                        indexEsc: 0,
                        inicio: listaSesiones[idSesion].inicio,
                        revisados: [],
                        en: req.body.english
                    });
                    bool = false;
                    break;
                }
            }
            if (bool) { //si no esta guardado el participante
                part = new Participante(req.user.email, req.user.username, req.user.password, true);
                part.id = req.user.id;
                part.crearSesionUser(idSesion);
                listaSesiones[idSesion].participantes.push(part);
                listaSesiones[idSesion].conectados.push(part);
                console.log("estoy en username del part en get en logueado: ", listaSesiones[idSesion].participantes);
                res.render('esperando.html', {
                    names: [],
                    noresultado: true,
                    username: req.user.username,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesionEnc,
                    creador: false,
                    idPart: req.user.id,
                    idPartEnc: encrypt(String(req.user.id), crypto),
                    indexEsc: 0,
                    inicio: listaSesiones[idSesion].inicio,
                    revisados: [],
                    en: req.body.english
                });
            }

        } else {
            console.log("estoy en username del part en get sin loguear: ", listaSesiones[idSesion].participantes);
            res.render('username.html', {
                idSesion: idSesion,
                emailInv: emailInv,
                idSesionEnc: req.params.idSesionEnc,
                emailInvEnc: req.params.emailInvEnc,
                creador: false,
                en: req.body.english
            });
        }
    });

    app.post('/sesion/username/:idSesionEnc/:emailInvEnc', function (req, res) {
        var idSesion = parseInt(decrypt(req.params.idSesionEnc, crypto));
        var emailInv = decrypt(req.params.emailInvEnc, crypto);
        //if (req.body.english == "true") listaSesiones[idSesion].english = true;
        //else listaSesiones[idSesion].english = false;
        listaSesiones[idSesion].url = '/sesion/esperando/' + req.params.idSesion + '/' + req.params.emailInv;
        var bool = true;
        if (req.isAuthenticated()) {
            //logueados[req.user.id].enSesion = true;
            //logueados[req.user.id].idSesion = idSesion;
            console.log("estoy en username del part en post en logueado: ", listaSesiones[idSesion].participantes);
            for (i = 0; i < listaSesiones[idSesion].participantes.length; i++){
                if (String(listaSesiones[idSesion].participantes[i].email) === String(emailInv)) {
                    res.render('esperando.html', {
                        names: [],
                        noresultado: true,
                        username: req.user.username,
                        idSesion: idSesion,
                        idSesionEnc: req.params.idSesionEnc,
                        creador: false,
                        idPart: req.user.id,
                        idPartEnc: encrypt(String(req.user.id), crypto),
                        indexEsc: 0,
                        inicio: listaSesiones[idSesion].inicio,
                        revisados: [],
                        en: req.body.english
                    });
                    bool = false;
                    break;
                }
            }
            if (bool) { //si no esta guardado el participante
                part = new Participante(req.user.email, req.user.username, req.user.password, true);
                part.id = req.user.id;
                part.crearSesionUser(idSesion);
                listaSesiones[idSesion].participantes.push(part);
                listaSesiones[idSesion].conectados.push(part);
                console.log("estoy en username del part en post en logueado: ", listaSesiones[idSesion].participantes);
                res.render('esperando.html', {
                    names: [],
                    noresultado: true,
                    username: req.user.username,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesionEnc,
                    creador: false,
                    idPart: req.user.id,
                    idPartEnc: encrypt(String(req.user.id), crypto),
                    indexEsc: 0,
                    inicio: listaSesiones[idSesion].inicio,
                    revisados: [],
                    en: req.body.english
                });
            }

        } else {
            console.log("estoy en username del part en post sin loguear: ", listaSesiones[idSesion].participantes);
            res.render('username.html', {
                idSesion: idSesion,
                emailInv: emailInv,
                idSesionEnc: req.params.idSesionEnc,
                emailInvEnc: req.params.emailInvEnc,
                creador: false,
                en: req.body.english
            });
        }
    });

    /////////////////////// PANTALLA DE ESPERA/CHAT ////////////////////////////////////
    app.get('/sesion/mod/iniciando/:idSesion/:emailInv', function (req, res) {
        var names_conectados = [];
        var moderador_guardado = false;
        var buttonText = "Iniciar juego!";
        var idSesion = parseInt(decrypt(req.params.idSesion, crypto));
        var url = '/sesion/mod/iniciando/' + req.params.idSesion + '/' + req.params.emailInv;
        if (req.body.english == "true") buttonText = "Start Game!";
        for (i = 0; i < listaSesiones[idSesion].conectados.length; i++) {
            if (listaSesiones[idSesion].conectados[i].username !== req.body.username)
                names_conectados.push(listaSesiones[idSesion].conectados[i].username);
        }
        for (j = 0; j < listaSesiones[idSesion].participantes.length; j++){
            if (listaSesiones[idSesion].participantes[j].id === listaSesiones[idSesion].moderador) {
                moderador_guardado = true;
                break;
            }
        }
        if (!moderador_guardado) {
            new Promise(function (resolve, reject) {
                part = new Participante(null, req.body.username, null, false);
                part.crearParticipante(resolve);
            }).then(function (data) {
                console.log(part.id);
                part.id = data;
                part.crearSesionUser(idSesion);
                part.guardarModerador(idSesion);
                listaSesiones[idSesion].moderador = part.id;
                listaSesiones[idSesion].participantes.push(part);
                listaSesiones[idSesion].conectados.push(part);
                console.log("estoy en iniciando del mod en get sin loguear: ", listaSesiones[idSesion].participantes);
                res.render('esperando.html', {
                    names: names_conectados,
                    noresultado: true,
                    username: req.body.username,
                    emailInv: null,
                    emailInvEnc: req.params.emailInv,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesion,
                    creador: true,
                    idPart: part.id,
                    idPartEnc: encrypt(String(part.id), crypto),
                    indexEsc: 0,
                    revisados: [],
                    inicio: listaSesiones[idSesion].inicio,
                    en: req.body.english,
                    buttonText: buttonText
                });
            });
        }   else {
            res.render('esperando.html', {
                names: names_conectados,
                noresultado: true,
                username: req.body.username,
                emailInv: null, //part.email
                emailInvEnc: req.params.emailInv,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesion,
                creador: true,
                idPart: listaSesiones[idSesion].moderador, //part.id
                idPartEnc: encrypt(String(listaSesiones[idSesion].moderador), crypto), //encrypt(String(part.id), crypto),
                indexEsc: 0,
                inicio: listaSesiones[idSesion].inicio,
                revisados: [],
                en: req.body.english,
                buttonText: buttonText
            });
        }
    });
    app.post('/sesion/mod/iniciando/:idSesion/:emailInv', function (req, res) {
        var names_conectados = [];
        var moderador_guardado = false;
        var buttonText = "Iniciar juego!";
        var idSesion = parseInt(decrypt(req.params.idSesion, crypto));
        if (req.body.english == "true") buttonText = "Start Game!";
        var url = '/sesion/mod/iniciando/' + req.params.idSesion + '/' + req.params.emailInv;
        for (i = 0; i < listaSesiones[idSesion].conectados.length; i++) {
            if (listaSesiones[idSesion].conectados[i].username !== req.body.username)
                names_conectados.push(listaSesiones[idSesion].conectados[i].username);
        }
        for (j = 0; j < listaSesiones[idSesion].participantes.length; j++){
            if (listaSesiones[idSesion].participantes[j].id === listaSesiones[idSesion].moderador) {
                moderador_guardado = true;
                break;
            }
        }
        if (!moderador_guardado) {
            new Promise(function (resolve, reject) {
                part = new Participante(null, req.body.username, null, false);
                part.crearParticipante(resolve);
            }).then(function (data) {
                part.id = data;
                part.crearSesionUser(idSesion);
                part.guardarModerador(idSesion);
                listaSesiones[idSesion].moderador = part.id;
                listaSesiones[idSesion].participantes.push(part);
                listaSesiones[idSesion].conectados.push(part);
                console.log("estoy en iniciando del mod en post sin loguear: ", listaSesiones[idSesion].participantes);
                res.render('esperando.html', {
                    names: names_conectados,
                    noresultado: true,
                    username: part.username,
                    emailInv: part.email,
                    emailInvEnc: req.params.emailInv,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesion,
                    creador: true,
                    idPart: part.id,
                    idPartEnc: encrypt(String(part.id), crypto),
                    indexEsc: 0,
                    revisados: [],
                    inicio: listaSesiones[idSesion].inicio,
                    en: req.body.english,
                    url: url,
                    buttonText: buttonText
                });
            });
        }   else {
            res.render('esperando.html', {
                names: names_conectados,
                noresultado: true,
                username: req.body.username,
                emailInv: null, //part.email
                emailInvEnc: req.params.emailInv,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesion,
                creador: true,
                idPart: listaSesiones[idSesion].moderador, //part.id
                idPartEnc: encrypt(String(listaSesiones[idSesion].moderador), crypto), //encrypt(String(part.id), crypto),
                indexEsc: 0,
                inicio: listaSesiones[idSesion].inicio,
                revisados: [],
                en: req.body.english,
                url: url,
                buttonText: buttonText
            });
        }
    });

    app.post('/sesion/part/iniciando/:idSesion/:emailInv', function (req, res) {
        var names_conectados = [];
        var buttonText = "Iniciar juego!";
        var idSesion = parseInt(decrypt(req.params.idSesion, crypto));
        if (req.body.english == "true") buttonText = "Start Game!";
        var emailInv = decrypt(req.params.emailInv, crypto);
        var url = '/sesion/part/iniciando/' + req.params.idSesion + '/' + req.params.emailInv;
        var bool = true;
        for (i = 0; i < listaSesiones[idSesion].participantes.length; i++){
            if (String(listaSesiones[idSesion].participantes[i].email) === String(emailInv))  {
                for (j = 0; j < listaSesiones[idSesion].conectados.length; j++){
                    if (listaSesiones[idSesion].conectados[j].username !== listaSesiones[idSesion].participantes[i].username)
                        names_conectados.push(listaSesiones[idSesion].conectados[j].username);
                }
                res.render('esperando.html', {
                    names: names_conectados,
                    noresultado: true,
                    username: listaSesiones[idSesion].participantes[i].username,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesion,
                    creador: false,
                    idPart: listaSesiones[idSesion].participantes[i].id,
                    idPartEnc: encrypt(String(listaSesiones[idSesion].participantes[i].id), crypto),
                    indexEsc: 0,
                    inicio: listaSesiones[idSesion].inicio,
                    revisados: [],
                    en: req.body.english,
                    url: url,
                    buttonText: buttonText
                });
                bool = false;
                break;
            }
        }
        if (bool) {
            new Promise(function (resolve, reject) {
                part = new Participante(emailInv, req.body.username, null, false);
                part.crearParticipante(resolve);
            }).then(function (data) {
                part.id = data;
                part.crearSesionUser(idSesion);
                for (j = 0; j < listaSesiones[idSesion].conectados.length; j++){
                    names_conectados.push(listaSesiones[idSesion].conectados[j].username);
                }
                listaSesiones[sesion.id].participantes.push(part);
                listaSesiones[sesion.id].conectados.push(part);
                console.log("estoy en iniciando del part en post sin loguear: ", listaSesiones[idSesion].participantes.length);
                res.render('esperando.html', {
                    names: names_conectados,
                    noresultado: true,
                    username: part.username,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesion,
                    creador: false,
                    idPart: part.id,
                    idPartEnc: encrypt(String(part.id), crypto),
                    indexEsc: 0,
                    inicio: listaSesiones[idSesion].inicio,
                    revisados: [],
                    en: req.body.english,
                    url: url,
                    buttonText: buttonText
                });
            });
        }
    });


    ////////////////////////// ESCENARIOS //////////////////////////////////
    app.post('/sesion/escenario/:idSesion/:indexEsc/:idPart/:username', function (req, res) {
        console.log("JELOUUUUUUUUUUUUU EDICION: ", req.body.editar);
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        var idPart = parseInt(decrypt(String(req.params.idPart), crypto));
        var nocreador = true;
        var editar = req.body.editar;
        var hr_finish = new Date().getTime();
        var hr_finish_editar = -1;
        var tiempo_extra = hr_finish + 1000*60*10;
        if (editar == "true") for (var i = 0; i < listaSesiones[idSesion].participantes.length;i ++) {
            if (parseInt(listaSesiones[idSesion].participantes[i].id) === parseInt(idPart)) {
                if (listaSesiones[idSesion].participantes[i].hr_finish == -1)
                    listaSesiones[idSesion].participantes[i].hr_finish = tiempo_extra;
                break;
            }
        }
        for (var i = 0; i < listaSesiones[idSesion].participantes.length;i ++) {
            if (parseInt(listaSesiones[idSesion].participantes[i].id) === parseInt(idPart)) {
                hr_finish_editar = listaSesiones[idSesion].participantes[i].hr_finish;
            }
        }
        if (req.body.editar2 == "true") editar = true; //estoy agregando tiempo en editar
        var indexEsc = parseInt(req.params.indexEsc);
        console.log("DAR TIEMPO",req.body.dar_tiempo,req.body.hh,req.body.mm,req.body.ss);
        if (parseInt(listaSesiones[idSesion].moderador) === idPart) {
            nocreador = false;
        }
        var namePart = 0;
        listaSesiones[idSesion].bool_result_final[3] = true;
        for (var i = 0; i < listaSesiones[idSesion].participantes.length;i ++){
            console.log(parseInt(listaSesiones[idSesion].participantes[i].id), parseInt(idPart), listaSesiones[idSesion].participantes[i].username);
            if (parseInt(listaSesiones[idSesion].participantes[i].id) === parseInt(idPart)) {
                namePart = i;
            }
        }
        listaSesiones[idSesion].IdxEscActual = indexEsc;
        listaSesiones[idSesion].inicio = true;
        listaSesiones[idSesion].escenarios.ver_resultado = false;
        hr_finish += 1000*60*60*listaSesiones[idSesion].escenarios[indexEsc].hh
            + 1000*60*listaSesiones[idSesion].escenarios[indexEsc].mm
            + 1000*listaSesiones[idSesion].escenarios[indexEsc].ss;
        if (req.body.dar_tiempo == "true" && idPart === listaSesiones[idSesion].moderador &&
            listaSesiones[idSesion].escenarios[indexEsc].flag)
        {
            if (1000*60*60*listaSesiones[idSesion].escenarios[indexEsc].hh
                + 1000*60*listaSesiones[idSesion].escenarios[indexEsc].mm
                + 1000*listaSesiones[idSesion].escenarios[indexEsc].ss <= 0 &&
                listaSesiones[idSesion].escenarios[indexEsc].hr_finish2 - hr_finish < 0)
            {
                listaSesiones[idSesion].escenarios[indexEsc].hr_finish2 = hr_finish +
                    1000*60*60*req.body.hh + 1000*60*req.body.mm + 1000*req.body.ss;
                listaSesiones[idSesion].escenarios[indexEsc].hr_finish = 0;
            }
            else
            {
                listaSesiones[idSesion].escenarios[indexEsc].flag = 0;
                if (listaSesiones[idSesion].escenarios[indexEsc].hr_finish2 - hr_finish > 0)
                    listaSesiones[idSesion].escenarios[indexEsc].hr_finish2 +=
                        1000*60*60*req.body.hh + 1000*60*req.body.mm + 1000*req.body.ss;
                else listaSesiones[idSesion].escenarios[indexEsc].hr_finish +=
                    1000*60*60*req.body.hh + 1000*60*req.body.mm + 1000*req.body.ss;
            }
        }
        hr_finish += listaSesiones[idSesion].escenarios[indexEsc].hr_finish;

        ///////////////// AQUI GUARDARÉLOS VOTOS AHORA /////////////
        ///////////// TAMBIEN DEBERIA IR EN RESULTADO FINAL :) /////////////
        if (indexEsc !== 0 && req.body.editar === "false" && !nocreador) {
            listaSesiones[idSesion].escenarios[indexEsc-1].votos.forEach(function(voto) {
                console.log("GUARDANDO EN ESCENARIO CON EL VOTANTE: ", voto.idParticipante, voto.username);
                listaSesiones[idSesion].escenarios[indexEsc-1].crearVoto(voto.prioridad, voto.idDecision ,voto.idParticipante, voto.username);
            });
        }
        models.Decision.findAll().then(function (decision) {
            listaDecisiones = decision;
            res.render('decisiones.html', {
                username: req.params.username,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesion,
                idPart: idPart,
                idPartEnc: req.params.idPart,
                indexEsc: indexEsc ,
                dec: listaDecisiones,
                esc: listaSesiones[idSesion].escenarios[indexEsc],
                hor: listaSesiones[idSesion].escenarios[indexEsc].hh,
                mi: listaSesiones[idSesion].escenarios[indexEsc].mm,
                se: listaSesiones[idSesion].escenarios[indexEsc].ss,
                hr_finish: hr_finish,
                hr_finish2: listaSesiones[idSesion].escenarios[indexEsc].hr_finish2,
                hr_finish_editar: hr_finish_editar,
                n: listaSesiones[idSesion].escenarios[indexEsc].cont,
                nocreador: nocreador,
                namePart: namePart,
                tiempo_extra: tiempo_extra,
                editar: editar,
                editar2: req.body.editar2,
                moderador: listaSesiones[idSesion].moderador
            });

        });
    });

    ///////////// mandando decisiones //////////////////

    app.post('/sesion/escenario/mandar_decisiones/:idSesion/:indexEsc/:idPart/:username', function(req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        var idPart = parseInt(decrypt(String(req.params.idPart), crypto));
        var indexEsc = parseInt(req.params.indexEsc);
        listaSesiones[idSesion].inicio = false;
        escenarioActual = (listaSesiones[idSesion].escenarios)[indexEsc];
        for (var i = escenarioActual.votos.length-1; i >= 0; i--) {
            console.log("EN EL FOR PA ELIMINAR WEAS: ", escenarioActual.votos[i].idParticipante, idPart);
            if (escenarioActual.votos[i].idParticipante === idPart) {
                console.log("SE ESTAN ELIMINANDO WEAS!");
                escenarioActual.votos.splice(i, 1);
            }
        }
        req.body.ids.forEach(function (idDecision) {
            escenarioActual.votos.push({
                prioridad: req.body.prioridad[idDecision-1],
                idDecision: idDecision,
                idParticipante: idPart,
                username: req.params.username
            });
        });
        indexEsc = parseInt(indexEsc)+1;
        if (indexEsc <= listaSesiones[idSesion].escenarios.length) {
            res.render('mandarDecisiones.html', {
                forzar_envio: req.body.forzar_envio,
                username: req.params.username,
                idSesionEnc: req.params.idSesion,
                idPartEnc: req.params.idPart,
                indexEsc: indexEsc,
                inicio: listaSesiones[idSesion].inicio,
                ver_resultado: listaSesiones[idSesion].escenarios.ver_resultado
            });
        }
    });

    app.post('/sesion/fin/:idSesion/:indexEsc/:idPart/:username', function(req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        models.Participante.destroy({
            where: {
                registrado: 0
            }
        });
        models.Sesion_user.destroy({
            where: {
                ParticipanteId: null
            }
        });
        if (idSesion in listaSesiones) {
            delete listaSesiones[idSesion];
        }
        res.render("finSesion.html");
    });

    app.post('/sesion/escenario/resultado/:idSesion/:indexEsc/:idPart/:username', function(req, res){
        console.log(req.body.forzar_envio);
        var aux = {};
        var VotosporPar = {};
        var cant_dec = {};
        var cant_dec1 = {};
        var cant_dec2 = {};
        var cant_dec3 = {};
        var dec_aux = [];
        var dec_aux1 = [];
        var dec_aux2 = [];
        var dec_aux3 = [];
        var cant_dec_tot = [];
        var cant_dec_tot50 = [];
        var cant_dec1_tot = [];
        var cant_dec2_tot = [];
        var cant_dec2_tot50 = [];
        var dec_todos_alta = [];
        var dec_todos_media = [];
        var dec_todos_media_alta = [];
        var dec_todos_no_selec = [];
        var index = [];
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        var idPart = parseInt(decrypt(String(req.params.idPart), crypto));
        var indexEsc = parseInt(req.params.indexEsc);
        var votosEsc = listaSesiones[idSesion].escenarios[indexEsc-1].votos;
        var num_part = listaSesiones[idSesion].participantes.length;
        console.log("VER AQUI",votosEsc);

        var hr_finish = new Date().getTime();
        hr_finish += 1000*60*60*listaSesiones[idSesion].escenarios[indexEsc-1].hh
            + 1000*60*listaSesiones[idSesion].escenarios[indexEsc-1].mm
            + 1000*listaSesiones[idSesion].escenarios[indexEsc-1].ss;

        if (req.body.dar_tiempo == "true") //se dio tiempo a los participantes que faltan por votar
        {
            if (1000*60*60*listaSesiones[idSesion].escenarios[indexEsc-1].hh
                + 1000*60*listaSesiones[idSesion].escenarios[indexEsc-1].mm
                + 1000*listaSesiones[idSesion].escenarios[indexEsc-1].ss <= 0 &&
                listaSesiones[idSesion].escenarios[indexEsc-1].hr_finish2 - hr_finish < 0)
            {
                listaSesiones[idSesion].escenarios[indexEsc-1].hr_finish2 = hr_finish +
                    1000*60*60*req.body.hh + 1000*60*req.body.mm + 1000*req.body.ss;
                listaSesiones[idSesion].escenarios[indexEsc-1].hr_finish = 0;
            }
            else
            {
                listaSesiones[idSesion].escenarios[indexEsc-1].flag = 0;
                if (listaSesiones[idSesion].escenarios[indexEsc-1].hr_finish2 - hr_finish > 0)
                    listaSesiones[idSesion].escenarios[indexEsc-1].hr_finish2 +=
                        1000*60*60*req.body.hh + 1000*60*req.body.mm + 1000*req.body.ss;
                else listaSesiones[idSesion].escenarios[indexEsc-1].hr_finish +=
                    1000*60*60*req.body.hh + 1000*60*req.body.mm + 1000*req.body.ss;
            }
        }

        listaSesiones[idSesion].escenarios.ver_resultado = true;
        var creador = false;
        if (parseInt(listaSesiones[idSesion].moderador) === parseInt(idPart)) {
            creador = true;
        }
        if (listaSesiones[idSesion].resultado_final.length < indexEsc) {
            for (i = 0; i < listaDecisiones.length; i++) {
                aux[listaDecisiones[i].dataValues.id] = 0;
            }
        }

        for(i = 0; i < votosEsc.length; i++) {
            VotosporPar[votosEsc[i].idParticipante] = [];
        }
        for(i = 0; i < votosEsc.length; i++) {
            VotosporPar[votosEsc[i].idParticipante].push([votosEsc[i].idDecision,votosEsc[i].prioridad]);
        }

        if (creador && listaSesiones[idSesion].bool_result_final[3]) {
            for (i = 0; i < votosEsc.length; i++) {
                listaSesiones[idSesion].bool_result_final[3] = false;
            }
        }
        listaSesiones[idSesion].bool_result_final[0]++;
        console.log("AAAAAAAAAAAAAAAAAH: ", indexEsc, listaSesiones[idSesion].escenarios.length);
        if (indexEsc === listaSesiones[idSesion].escenarios.length)
            listaSesiones[idSesion].bool_result_final[1] = true;


        F = []; /*F=[[nombrePart1,[[dec1,prioridad],[dec2,prioridad],...]],
                [nombrePart2,[[dec1,prioridad],[dec2,prioridad],...]]]*/
        for (idPart in VotosporPar){
            aux = [];
            aux2 = [];
            for (i = 0; i < listaSesiones[idSesion].participantes.length; i++){
                if (parseInt(listaSesiones[idSesion].participantes[i].id) == parseInt(idPart)){
                    aux.push(listaSesiones[idSesion].participantes[i].username);
                    break;
                }

            }
            for (dec = 0; dec < VotosporPar[idPart].length; dec++) {
                for (i = 0; i < listaDecisiones.length; i++) {
                    if (parseInt(listaDecisiones[i].id) == parseInt(VotosporPar[idPart][dec][0])) {
                        aux2.push([listaDecisiones[i].nombre,VotosporPar[idPart][dec][1]]);
                        break;
                    }
                }
            }
            aux.push(aux2);

            F.push(aux);
        }
        listaSesiones[idSesion].resultados[indexEsc - 1] = F;
        var resultados = listaSesiones[idSesion].resultados;


        for (Part in resultados[indexEsc-1]) {
            for (dec in resultados[indexEsc-1][Part][1]) {

                if (resultados[indexEsc-1][Part][1][dec][1] === "No Seleccionada") {
                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec3) cant_dec3[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec3[resultados[indexEsc-1][Part][1][dec][0]] = 1;

                }

                if (resultados[indexEsc-1][Part][1][dec][1] === "Alta") {
                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec) cant_dec[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec[resultados[indexEsc-1][Part][1][dec][0]] = 1;

                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec2) cant_dec2[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec2[resultados[indexEsc-1][Part][1][dec][0]] = 1;
                }

                if (resultados[indexEsc-1][Part][1][dec][1] === "Media") {
                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec1) cant_dec1[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec1[resultados[indexEsc-1][Part][1][dec][0]] = 1;

                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec2) cant_dec2[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec2[resultados[indexEsc-1][Part][1][dec][0]] = 1;
                }

            }
        }
        /////////////////////////////// Estadisticas ////////////////////////////////////
        for (dec in cant_dec)
        {
            if (cant_dec[dec] == num_part) dec_aux.push(dec);
        }
        dec_todos_alta.push([indexEsc-1,dec_aux]);

        for (dec in cant_dec1)
        {
            if (cant_dec1[dec] == num_part) dec_aux1.push(dec);
        }
        dec_todos_media.push([indexEsc-1,dec_aux1]);

        for (dec in cant_dec2)
        {
            if (cant_dec2[dec] == num_part) dec_aux2.push(dec);
        }
        dec_todos_media_alta.push([indexEsc-1,dec_aux2]);

        for (dec in cant_dec3)
        {
            if (cant_dec3[dec] == num_part) dec_aux3.push(dec);
        }
        dec_todos_no_selec.push([indexEsc-1,dec_aux3]);
        /////////////////////////////////////////////////////////////////////////////

        /////////////////// Armar estructuras para el grafico //////////////
        var Aux = [];
        var Aux50 = [];
        for(key in cant_dec){
            if (!(key in cant_dec3)) {
                Aux.push({name: key, y: cant_dec[key]});
                Aux50.push({name: key, y: cant_dec[key]});
            }
            else if (cant_dec3[key] >= num_part/2.0) {
                Aux50.push({name: key, y: cant_dec[key]});
            }
        }
        cant_dec_tot.push(Aux);
        cant_dec_tot50.push(Aux50);

        Aux = [];
        for(key in cant_dec1){
            if (!(key in cant_dec3)) {
                Aux.push({name: key, y: cant_dec1[key]});
            }
        }
        cant_dec1_tot.push(Aux);

        Aux = [];
        Aux50 = [];
        for(key in cant_dec2){
            if (!(key in cant_dec3)) {
                Aux.push({name: key, y: cant_dec2[key]});
                Aux50.push({name: key, y: cant_dec2[key]});
            }
            else if (cant_dec3[key] >= num_part/2.0) {
                Aux50.push({name: key, y: cant_dec2[key]});
            }
        }
        cant_dec2_tot.push(Aux);
        cant_dec2_tot50.push(Aux50);

        index.push(indexEsc-1);
        /////////////////////////////////////////////////////////////////////////////


        cant_dec_tot.stringify = JSON.stringify(cant_dec_tot);
        cant_dec1_tot.stringify = JSON.stringify(cant_dec1_tot);
        cant_dec2_tot.stringify = JSON.stringify(cant_dec2_tot);
        cant_dec_tot50.stringify = JSON.stringify(cant_dec_tot50);
        cant_dec2_tot50.stringify = JSON.stringify(cant_dec2_tot50);
        index.stringify = JSON.stringify(index);
        var names_conectados = [];
        for (var i = 0; i < listaSesiones[idSesion].conectados.length; i++) {
            if (listaSesiones[idSesion].conectados[i].username !== req.params.username)
                names_conectados.push(listaSesiones[idSesion].conectados[i].username);
        }
        console.log("TENGO Q VER AQUI:",idPart, listaSesiones[idSesion].moderador);
        res.render('resultadoEsc.html', {
            forzar_envio: req.body.forzar_envio,
            names: names_conectados,
            revisados: listaSesiones[idSesion].escenarios[indexEsc-1].revisados,
            grafico1: cant_dec_tot,
            grafico2: cant_dec1_tot,
            grafico3: cant_dec2_tot,
            grafico4: cant_dec_tot50,
            grafico5: cant_dec2_tot50,
            altas: dec_todos_alta,
            medias: dec_todos_media ,
            altas_medias: dec_todos_media_alta,
            VotosporPart: F,
            username: req.params.username,
            idSesion: idSesion,
            idSesionEnc: req.params.idSesion,
            idPartEnc: req.params.idPart,
            indexEsc: indexEsc,
            creador: creador,
            inicio: listaSesiones[idSesion].inicio,
            result_final: listaSesiones[idSesion].bool_result_final[1],
            result_final_part: listaSesiones[idSesion].bool_result_final[2],
            idx: index,
            moderador: listaSesiones[idSesion].moderador,
            idPart: idPart
        });
    });

    app.post('/sesion/resultfinal/:idSesion/:indexEsc/:idPart/:username', function(req, res){
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        var idPart = parseInt(decrypt(String(req.params.idPart), crypto));
        var indexEsc = parseInt(req.params.indexEsc);
        var creador = false;
        var dec_todos_alta = []; // = [[indexEsc1,[dec1, dec3]],... ]
        var dec_todos_media = [];
        var dec_todos_media_alta = [];
        var dec_todos_no_selec = [];
        var cant_dec_tot = []; // [[indexEsc1,cant_dec1],...]
        var cant_dec1_tot = [];
        var cant_dec2_tot = [];
        var cant_dec_tot50 = [];
        var cant_dec2_tot50 = [];
        var num_part = listaSesiones[idSesion].participantes.length;
        var esc = [];
        var index = [];

        if (parseInt(listaSesiones[idSesion].moderador) === parseInt(idPart)) {
            creador = true;
        }

        /////////// GUARDANDO EN LA BD LOS VOTOS ///////////////
        if (indexEsc !== 0 && creador && !listaSesiones[idSesion].votosGuardados) {
            listaSesiones[idSesion].escenarios[indexEsc-1].votos.forEach(function(voto) {
                console.log("GUARDANDO EN FINAL CON EL VOTANTE: ", voto.idParticipante, voto.username);
                listaSesiones[idSesion].escenarios[indexEsc-1].crearVoto(voto.prioridad, voto.idDecision ,voto.idParticipante, voto.username);
            });
            listaSesiones[idSesion].votosGuardados = true;
        }

        if (req.body.escenarios === undefined) index.push("1");
        else index.push(req.body.escenarios);
        for (var i = 0; i < listaSesiones[idSesion].escenarios.length; i++)
        {
            esc.push(i+1);
        }

        /*  resultados={"0": F_1,"1"; F_2,..}
            F_n=[[nombrePart1,[[dec1,prioridad],[dec2,prioridad],...]],
                [nombrePart2,[[dec1,prioridad],[dec2,prioridad],...]]]*/

        var resultados = listaSesiones[idSesion].resultados;

        for (var idx in resultados)
        {
            var cant_dec = {};
            var cant_dec1 = {};
            var cant_dec2 = {};
            var cant_dec3 = {};
            var dec_aux = [];
            var dec_aux1 = [];
            var dec_aux2 = [];
            var dec_aux3 = [];
            for (Part in resultados[idx])
            {
                for (dec in resultados[idx][Part][1])
                {
                    if (resultados[idx][Part][1][dec][1] === "Alta")
                    {
                        if (resultados[idx][Part][1][dec][0] in cant_dec) cant_dec[resultados[idx][Part][1][dec][0]]++;
                        else cant_dec[resultados[idx][Part][1][dec][0]] = 1;

                        if (resultados[idx][Part][1][dec][0] in cant_dec2) cant_dec2[resultados[idx][Part][1][dec][0]]++;
                        else cant_dec2[resultados[idx][Part][1][dec][0]] = 1;
                    }
                    if (resultados[idx][Part][1][dec][1] === "Media")
                    {
                        if (resultados[idx][Part][1][dec][0] in cant_dec1) cant_dec1[resultados[idx][Part][1][dec][0]]++;
                        else cant_dec1[resultados[idx][Part][1][dec][0]] = 1;

                        if (resultados[idx][Part][1][dec][0] in cant_dec2) cant_dec2[resultados[idx][Part][1][dec][0]]++;
                        else cant_dec2[resultados[idx][Part][1][dec][0]] = 1;
                    }
                    if (resultados[idx][Part][1][dec][1] === "No Seleccionada")
                    {
                        if (resultados[idx][Part][1][dec][0] in cant_dec3) cant_dec3[resultados[idx][Part][1][dec][0]]++;
                        else cant_dec3[resultados[idx][Part][1][dec][0]] = 1;
                    }

                }
            }
            /////////////////////////////// Estadisticas ////////////////////////////////////
            for (dec in cant_dec)
            {
                if (cant_dec[dec] == num_part) dec_aux.push(dec);
            }
            dec_todos_alta.push([idx,dec_aux]);

            for (dec in cant_dec1)
            {
                if (cant_dec1[dec] == num_part) dec_aux1.push(dec);
            }
            dec_todos_media.push([idx,dec_aux1]);

            for (dec in cant_dec2)
            {
                if (cant_dec2[dec] == num_part) dec_aux2.push(dec);
            }
            dec_todos_media_alta.push([idx,dec_aux2]);

            for (dec in cant_dec3)
            {
                if (cant_dec3[dec] == num_part) dec_aux3.push(dec);
            }
            dec_todos_no_selec.push([idx,dec_aux3]);
            /////////////////////////////////////////////////////////////////////////////////////

            /////////////////// Armar estructuras para el grafico //////////////
            var Aux = [];
            var Aux50 = [];
            for(key in cant_dec){
                if (!(key in cant_dec3)) {
                    Aux.push({name: key, y: cant_dec[key]});
                    Aux50.push({name: key, y: cant_dec[key]});
                }
                else if (cant_dec3[key] >= num_part/2.0) {
                    Aux50.push({name: key, y: cant_dec[key]});
                }
            }
            cant_dec_tot.push(Aux);
            cant_dec_tot50.push(Aux50);

            Aux = [];
            for(key in cant_dec1){
                if (!(key in cant_dec3)) {
                    Aux.push({name: key, y: cant_dec1[key]});
                }
            }
            cant_dec1_tot.push(Aux);

            Aux = [];
            Aux50 = [];
            for(key in cant_dec2){
                if (!(key in cant_dec3)) {
                    Aux.push({name: key, y: cant_dec2[key]});
                    Aux50.push({name: key, y: cant_dec2[key]});
                }
                else if (cant_dec3[key] >= num_part/2.0) {
                    Aux50.push({name: key, y: cant_dec2[key]});
                }
            }
            cant_dec2_tot.push(Aux);
            cant_dec2_tot50.push(Aux50);

            index.push(indexEsc-1);
            /////////////////////////////////////////////////////////////////////////////
        }
        cant_dec_tot.stringify = JSON.stringify(cant_dec_tot);
        cant_dec1_tot.stringify = JSON.stringify(cant_dec1_tot);
        cant_dec2_tot.stringify = JSON.stringify(cant_dec2_tot);
        cant_dec_tot50.stringify = JSON.stringify(cant_dec_tot50);
        cant_dec2_tot50.stringify = JSON.stringify(cant_dec2_tot50);
        dec_todos_alta.stringify = JSON.stringify(dec_todos_alta);
        dec_todos_media.stringify = JSON.stringify(dec_todos_media);
        dec_todos_media_alta.stringify = JSON.stringify(dec_todos_media_alta);
        index.stringify = JSON.stringify(index);


        listaSesiones[idSesion].resultado_final.stringify = JSON.stringify(listaSesiones[idSesion].resultado_final);
        res.render('resultadoFinal.html', {
            grafico1: cant_dec_tot,
            grafico2: cant_dec1_tot,
            grafico3: cant_dec2_tot,
            grafico4: cant_dec_tot50,
            grafico5: cant_dec2_tot50,
            cant_dec: cant_dec,
            todos_alta: dec_todos_alta,
            todos_media: dec_todos_media,
            todos_media_alta: dec_todos_media_alta,
            res_final: listaSesiones[idSesion].resultado_final,
            username: req.params.username,
            idSesionEnc: req.params.idSesion,
            idPartEnc: req.params.idPart,
            indexEsc: indexEsc  ,
            creador: creador,
            inicio: listaSesiones[idSesion].inicio,
            result_final: listaSesiones[idSesion].bool_result_final[1],
            esc: esc,
            idx: index,
            idSesion: idSesion
        });
    });

    app.get('/historial', function(req, res) {
        new Promise(function(resolve) {
            var part = new Participante(null, null, null, null);
            part.historial(req.user.id, resolve);
        }).then(function(data){
            new Promise(function(resolve2) {
                var part = new Participante(null, null, null, null);
                part.historial2(data, resolve2);
            }).then(function(data2) {
                res.render("historial.html", {
                    sesiones: data2
                });
            });

        });
    });

    app.post('/historial/sesion', function(req, res) {
        console.log(req.body.sesiones);
    });
};