var Sesion = require('../controllers/Sesion');
var Escenario = require('../controllers/Escenario');
var Invitado = require('../controllers/Invitado');
var Participante = require('../controllers/Participante');
var models  = require('../models');
var decrypt = require('../controllers/decrypt');
var encrypt = require('../controllers/encrypt');

module.exports = function(app, passport, nodemailer, crypto, listaSesiones, listaDecisiones, logueados, resultado_por_escenario, bool_result_final, resultado_final) {

    app.get('/', function (req, res) {
        res.render('index.html', {success: req.flash('success'),
            error: req.flash('error')});
    });

    app.get('/layout', function(res) {
        res.render('layout.html');
    });
    //////////////////////////LOGIN///////////////////////////////////////
    app.get('/login', function (req, res) {
        res.render('login.html', {success: req.flash('success'),
            error: req.flash('error')});
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/registro', function (req, res) {
        console.log("HOLAAAA");
        res.render('registro.html', {success: req.flash('success'),
            error: req.flash('error')});
    });

    app.post('/registro', passport.authenticate('local-signup', {
        successRedirect: '/', // redirect to the secure profiles.handlebars section
        failureRedirect: '/registro', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profiles', {
            user: req.user // get the user out of session and pass to template
        });
    });

    app.get('/logout', function (req, res) {
        delete logueados[req.user.id];
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
                res.redirect('/crear_sesion/' + encrypt(String(sesion.id), crypto));
            });
        }
    });
    ///////////////////// CREAR SESION ///////////////////////////////////////
    app.get('/crear_sesion/:idSesionEnc', function (req, res) {
        res.render('crearSesion.html', {
            errors: [],
            sesion: listaSesiones[parseInt(decrypt(req.params.idSesionEnc, crypto))],
            idSesionEnc: req.params.idSesionEnc,
            repetido: false,
            propio: false,
            notiempo: false,
            notiempo: false,
            escrepetido: false,
            invitados: [],
            escenarios: [],
            noinv: false,
            noesc: false
        });
    });

    //////////// invitados /////////
    app.post('/crear_sesion/invitar/:idSesionEnc', function (req, res) {
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        var errors = req.validationErrors();
        var repetido = false;
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        listaSesiones[idSesion].invitados.forEach(function (invitado) {
            if (invitado.email.toString() === req.body.email.toString()) {
                repetido = true;
                return;
            }
        });
        if (repetido) {
            res.render('crearSesion.html', {
                errors: errors,
                sesion: listaSesiones[idSesion],
                idSesionEnc: req.params.idSesionEnc,
                repetido: true,
                propio: false,
                notiempo: false,
                escrepetido: false,
                invitados: listaSesiones[idSesion].invitados,
                escenarios: listaSesiones[idSesion].escenarios,
                noinv: false,
                noesc: false
            });
            return;
        }
        if (req.user) {
            if (req.user.email.toString() === req.body.email.toString()) {
                res.render('crearSesion.html', {
                    errors: errors,
                    sesion: listaSesiones[idSesion],
                    idSesionEnc: req.params.idSesionEnc,
                    repetido: false,
                    propio: true,
                    notiempo: false,
                    escrepetido: false,
                    invitados: listaSesiones[idSesion].invitados,
                    escenarios: listaSesiones[idSesion].escenarios,
                    noinv: false,
                    noesc: false
                });
                return;
            }
        }
        if (!errors) {
            invitado = new Invitado(req.body.email);
            listaSesiones[idSesion].invitados.push(invitado);
        }
        res.render('crearSesion.html', {
            errors: errors,
            sesion: listaSesiones[idSesion],
            idSesionEnc: req.params.idSesionEnc,
            repetido: false,
            propio: false,
            notiempo: false,
            escrepetido: false,
            invitados: listaSesiones[idSesion].invitados,
            escenarios: listaSesiones[idSesion].escenarios,
            noinv: false,
            noesc: false
        });
    });

    /////////////// añadiendo escenarios ///////////////
    app.post('/crear_sesion/esc/:idSesionEnc', function (req, res) {
        req.checkBody('esc', 'escribe un objetivo').notEmpty();
        req.checkBody('hh', 'la hora debe ser un número entero').isInt();
        req.checkBody('mm', 'los minutos deben ser un número entero').isInt();
        req.checkBody('ss', 'los segundos deben ser un número entero').isInt();
        var errors = req.validationErrors();
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        if (!req.body.hh && !req.body.mm && !req.body.ss) {
            res.render('crearSesion.html', {
                errors: errors,
                sesion: listaSesiones[idSesion],
                idSesionEnc: req.params.idSesionEnc,
                repetido: false,
                propio: false,
                notiempo: true,
                escrepetido: false,
                invitados: listaSesiones[idSesion].invitados,
                escenarios: listaSesiones[idSesion].escenarios,
                noinv: false,
                noesc: false
            });
            return;
        }
        var repetido = false;
        listaSesiones[idSesion].escenarios.forEach(function (esc) {
            if (esc.objetivo.toString() === req.body.esc.toString()) {
                repetido = true;
                return;
            }
        });
        if (repetido) {
            res.render('crearSesion.html', {
                errors: errors,
                sesion: listaSesiones[idSesion],
                idSesionEnc: req.params.idSesionEnc,
                repetido: false,
                propio: false,
                notiempo: false,
                escrepetido: true,
                invitados: listaSesiones[idSesion].invitados,
                escenarios: listaSesiones[idSesion].escenarios,
                noinv: false,
                noesc: false
            });
            return;
        }
        if (!errors) {
            new Promise(function (resolve, reject) {
                esc = new Escenario(req.body.esc, req.body.hh, req.body.mm, req.body.ss, idSesion);
                esc.crearEscenario(resolve);
            }).then(function (data) {
                esc.id = data;
                esc.crearSesionEsc();
                listaSesiones[idSesion].escenarios.push(esc);
                res.render('crearSesion.html', {
                    errors: false,
                    sesion: listaSesiones[idSesion],
                    idSesionEnc: req.params.idSesionEnc,
                    repetido: false,
                    propio: false,
                    notiempo: false,
                    escrepetido: false,
                    invitados: listaSesiones[idSesion].invitados,
                    escenarios: listaSesiones[idSesion].escenarios,
                    noinv: false,
                    noesc: false
                });
            });
        } else {
            res.render('crearSesion.html', {
                errors: errors,
                sesion: listaSesiones[idSesion],
                idSesionEnc: req.params.idSesionEnc,
                repetido: false,
                propio: false,
                notiempo: false,
                escrepetido: false,
                invitados: listaSesiones[idSesion].invitados,
                escenarios: listaSesiones[idSesion].escenarios,
                noinv: false,
                noesc: false
            });
        }
    });

    /////////////enviar invitaciones//////////////
    app.post('/crear_sesion/:idSesionEnc', function (req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        if (listaSesiones[idSesion].invitados.length === 0 && listaSesiones[idSesion].escenarios.length === 0) {
            res.render('crearSesion.html', {
                sesion: listaSesiones[idSesion],
                noinv: true,
                noesc: true,
                idSesionEnc: req.params.idSesionEnc,
                errors: false,
                repetido: false,
                propio: false,
                notiempo: false,
                escrepetido: false,
                invitados: listaSesiones[idSesion].invitados,
                escenarios: listaSesiones[idSesion].escenarios
            });
            return;
        }
        else if (listaSesiones[idSesion].invitados.length === 0) {
            res.render('crearSesion.html', {
                sesion: listaSesiones[idSesion],
                noinv: true,
                idSesionEnc: req.params.idSesionEnc,
                errors: false,
                repetido: false,
                propio: false,
                notiempo: false,
                escrepetido: false,
                invitados: listaSesiones[idSesion].invitados,
                escenarios: listaSesiones[idSesion].escenarios
            });
            return;
        }
        else if (listaSesiones[idSesion].escenarios.length === 0) {
            res.render('crearSesion.html', {
                sesion: listaSesiones[idSesion],
                noesc: true,
                idSesionEnc: req.params.idSesionEnc,
                errors: false,
                repetido: false,
                propio: false,
                notiempo: false,
                escrepetido: false,
                invitados: listaSesiones[idSesion].invitados,
                escenarios: listaSesiones[idSesion].escenarios
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
                invitado.enviarEmail(smtpTransport, crypto, req.params.idSesionEnc, res);
            });

            res.redirect('/sesion/moderador/username/'
                + req.params.idSesionEnc + '/'
                + encrypt(String(listaSesiones[idSesion].creador), crypto)
            );

            return;
        }
    });

    ///////////////////////// PANTALLA USERNAME ////////////////////////////////
    app.get('/sesion/moderador/username/:idSesionEnc/:emailInvEnc', function (req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        var emailInv = decrypt(req.params.emailInvEnc, crypto);
        listaSesiones[idSesion].url = '/sesion/mod/iniciando/' + req.params.idSesionEnc + '/' + req.params.emailInvEnc;
        if (req.isAuthenticated()) {
            logueados[req.user.id].enSesion = true;
            logueados[req.user.id].idSesion = idSesion;
            part = new Participante(req.user.email, req.user.username, req.user.password, true);
            part.id = req.user.id;
            part.crearSesionUser(idSesion);
            part.guardarModerador(idSesion);
            listaSesiones[idSesion].moderador = part.id;
            listaSesiones[idSesion].participantes.push(part);
            listaSesiones[idSesion].conectados.push(part);
            console.log("estoy en username del mod en get en logueado: ", listaSesiones[idSesion].participantes);
            res.render('esperando.html', {
                noresultado: true,
                username: req.user.username,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesionEnc,
                creador: true,
                idPart: req.user.id,
                idPartEnc: encrypt(String(req.user.id), crypto),
                indexEsc: 0,
                inicio: listaSesiones[idSesion].inicio,
                revisados: []
            });
        } else {
            console.log("estoy en username del mod en get sin loguear: ", listaSesiones[idSesion].participantes);
            res.render('username.html', {
                idSesion: idSesion,
                emailInv: emailInv,
                idSesionEnc: req.params.idSesionEnc,
                emailInvEnc: req.params.emailInvEnc,
                creador: true
            });
        }
    });

    app.get('/sesion/username/:idSesionEnc/:emailInvEnc', function (req, res) {
        var idSesion = parseInt(decrypt(req.params.idSesionEnc, crypto));
        var emailInv = decrypt(req.params.emailInvEnc, crypto);
        listaSesiones[idSesion].url = '/sesion/esperando/' + req.params.idSesion + '/' + req.params.emailInv;
        if (req.isAuthenticated()) {
            logueados[req.user.id].enSesion = true;
            logueados[req.user.id].idSesion = idSesion;
            part = new Participante(req.user.email, req.user.username, req.user.password, true);
            part.id = req.user.id;
            part.crearSesionUser(idSesion);
            listaSesiones[idSesion].participantes.push(part);
            listaSesiones[idSesion].conectados.push(part);
            console.log("estoy en username del part en get en logueado: ", listaSesiones[idSesion].participantes);
            res.render('esperando.html', {
                noresultado: true,
                username: req.user.username,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesionEnc,
                creador: false,
                idPart: req.user.id,
                idPartEnc: encrypt(String(req.user.id), crypto),
                indexEsc: 0,
                inicio: listaSesiones[idSesion].inicio,
                revisados: []
            });
        } else {
            console.log("estoy en username del part en get sin loguear: ", listaSesiones[idSesion].participantes);
            res.render('username.html', {
                idSesion: idSesion,
                emailInv: emailInv,
                idSesionEnc: req.params.idSesionEnc,
                emailInvEnc: req.params.emailInvEnc,
                creador: false
            });
        }
    });

    /////////////////////// PANTALLA DE ESPERA/CHAT ////////////////////////////////////
    app.get('/sesion/mod/iniciando/:idSesion/:emailInv', function (req, res) {
        var names_conectados = [];
        var idSesion = parseInt(decrypt(req.params.idSesion, crypto));
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
            console.log("CONECTADOS", listaSesiones[idSesion].conectados);
            for (i = 0; i < listaSesiones[idSesion].conectados.length; i++){
                console.log(listaSesiones[idSesion].conectados[i].username);
                names_conectados.push(listaSesiones[idSesion].conectados[i].username);
            }
            console.log("estoy en iniciando del mod en get sin loguear: ", listaSesiones[idSesion].participantes);
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
                inicio: listaSesiones[idSesion].inicio,
                revisados: []
            });
        });
    });
    app.post('/sesion/mod/iniciando/:idSesion/:emailInv', function (req, res) {
        var names_conectados = [];
        var idSesion = parseInt(decrypt(req.params.idSesion, crypto));
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
            console.log("CONECTADOS2", listaSesiones[idSesion].conectados);
            for (i = 0; i < listaSesiones[idSesion].conectados.length; i++){
                names_conectados.push(listaSesiones[idSesion].conectados[i].username);
            }
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
                inicio: listaSesiones[idSesion].inicio,
                revisados: []
            });
        });
    });

    app.post('/sesion/part/iniciando/:idSesion/:emailInv', function (req, res) {
        var idSesion = parseInt(decrypt(req.params.idSesion, crypto));
        var emailInv = decrypt(req.params.emailInv, crypto);
        if (listaSesiones[idSesion].inicio){
            new Promise(function (resolve, reject) {
                part = new Participante(emailInv, req.body.username, null, false);
                part.crearParticipante(resolve);
            }).then(function (data) {
                part.id = data;
                part.crearSesionUser(idSesion);
                listaSesiones[sesion.id].participantes.push(part);
                listaSesiones[sesion.id].conectados.push(part);
                console.log("estoy en iniciando del part en post sin loguear: ", listaSesiones[idSesion].participantes);
                res.render('esperando.html', {
                    noresultado: true,
                    username: part.username,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesion,
                    creador: false,
                    idPart: part.id,
                    idPartEnc: encrypt(String(part.id), crypto),
                    indexEsc: 0,
                    inicio: listaSesiones[idSesion].inicio,
                    revisados: []
                });
            });
        }   else {
            res.render('esperando.html', {
                noresultado: true,
                username: req.body.username,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesion,
                creador: false,
                idPart: null,
                idPartEnc: null,
                indexEsc: 0,
                inicio: listaSesiones[idSesion].inicio,
                revisados: []
            });
        }
    });


    ////////////////////////// ESCENARIOS //////////////////////////////////
    app.post('/sesion/escenario/:idSesion/:indexEsc/:idPart/:username', function (req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        var idPart = parseInt(decrypt(String(req.params.idPart), crypto));
        var nocreador = true;
        if (parseInt(listaSesiones[idSesion].moderador) === parseInt(idPart)) {
            nocreador = false;
        }
        console.log("HORAAA",listaSesiones[idSesion].escenarios[req.params.indexEsc].hr_finish);
        var namePart = 0;
        bool_result_final[3] = true;
        for (i = 0; i < listaSesiones[idSesion].participantes.length;i ++){
            console.log(parseInt(listaSesiones[idSesion].participantes[i].id), parseInt(idPart), listaSesiones[idSesion].participantes[i].username);
            if (parseInt(listaSesiones[idSesion].participantes[i].id) === parseInt(idPart)) {
                namePart = i;
            }
        }
        listaSesiones[idSesion].escenarios[req.params.indexEsc].cont++;
        listaSesiones[idSesion].IdxEscActual = parseInt(req.params.indexEsc);
        listaSesiones[idSesion].inicio = true;
        listaSesiones[idSesion].escenarios.ver_resultado = false;
        console.log(listaSesiones[idSesion].participantes);
        console.log("CONECTADOS", listaSesiones[idSesion].conectados);
        var hr_finish = new Date().getTime();
        hr_finish += 1000*60*60*listaSesiones[idSesion].escenarios[req.params.indexEsc].hh
            + 1000*60*listaSesiones[idSesion].escenarios[req.params.indexEsc].mm
            + 1000*listaSesiones[idSesion].escenarios[req.params.indexEsc].ss;
        models.Decision.findAll().then(function (decision) {
            listaDecisiones=decision;
            res.render('decisiones.html', {
                username: req.params.username,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesion,
                idPart: idPart,
                idPartEnc: req.params.idPart,
                indexEsc: parseInt(req.params.indexEsc),
                dec: listaDecisiones,
                esc: listaSesiones[idSesion].escenarios[req.params.indexEsc],
                hor: listaSesiones[idSesion].escenarios[req.params.indexEsc].hh,
                mi: listaSesiones[idSesion].escenarios[req.params.indexEsc].mm,
                se: listaSesiones[idSesion].escenarios[req.params.indexEsc].ss,
                hr_finish: hr_finish,
                n: listaSesiones[idSesion].escenarios[req.params.indexEsc].cont,
                nocreador: nocreador,
                namePart: namePart
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
        // cambie lang por dec
        req.body.lang.forEach(function (idDecision) {
            console.log(idDecision);
            escenarioActual.crearVoto(idDecision,idPart);
            escenarioActual.votos.push({
                idDecision: idDecision,
                idParticipante: idPart
            });
        });
        console.log(escenarioActual.votos);
        res.render('mandarDecisiones.html',
            {
                username: req.params.username,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesion,
                idPart: idPart,
                idPartEnc: req.params.idPart,
                indexEsc: req.params.indexEsc
            });
    });

    /////////////////esperandoo////////////////////7
    app.post('/sesion/escenario/esperando/:idSesion/:indexEsc/:idPart/:username', function (req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        var idPart = parseInt(decrypt(String(req.params.idPart), crypto));
        var indexEsc = parseInt(req.params.indexEsc);
        escenarioActual = (listaSesiones[idSesion].escenarios)[indexEsc];
        var creador = false;
        if (parseInt(listaSesiones[idSesion].moderador) === parseInt(idPart)) {
            creador = true;
        }
        console.log("REVISADOOOOOOOOOOOOOOS", listaSesiones[idSesion].escenarios[indexEsc].revisados);
        indexEsc = parseInt(indexEsc)+1;
        if (indexEsc <= listaSesiones[idSesion].escenarios.length) {
            res.render('esperando.html', {
                noresultado: false,
                username: req.params.username,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesion,
                creador: creador,
                idPart: idPart,
                idPartEnc: req.params.idPart,
                indexEsc: indexEsc,
                inicio: listaSesiones[idSesion].inicio,
                revisados: listaSesiones[idSesion].escenarios[indexEsc-1].revisados,
                ver_resultado: listaSesiones[idSesion].escenarios.ver_resultado
            });
        } else {
            //resultados!!!!!!!!
        }
    });

    app.post('/sesion/escenario/resultado/:idSesion/:indexEsc/:idPart/:username', function(req, res){
        var aux = {};
        var contVotos = {};
        var VotosporPar = {};
        for(i = 0; i < listaDecisiones.length; i++) {
            contVotos[listaDecisiones[i].dataValues.id] = 0;
        }
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        var idPart = parseInt(decrypt(String(req.params.idPart), crypto));
        var indexEsc = parseInt(req.params.indexEsc);
        var votosEsc = listaSesiones[idSesion].escenarios[indexEsc-1].votos;
        listaSesiones[idSesion].escenarios.ver_resultado = true;
        var creador = false;
        if (parseInt(listaSesiones[idSesion].moderador) === parseInt(idPart)) {
            creador = true;
        }
        if (resultado_final.length < indexEsc) {
            for (i = 0; i < listaDecisiones.length; i++) {
                aux[listaDecisiones[i].dataValues.id] = 0;
            }
        }

        for(i = 0; i < votosEsc.length; i++) {
            VotosporPar[votosEsc[i].idParticipante] = [];
        }

        for(i = 0; i < votosEsc.length; i++) {
            VotosporPar[votosEsc[i].idParticipante].push(votosEsc[i].idDecision);
        }

        for(i = 0; i < votosEsc.length; i++) {
            contVotos[votosEsc[i].idDecision]++;
        }

        if (creador && bool_result_final[3]) {
            for (i = 0; i < votosEsc.length; i++) {
                bool_result_final[3] = false;
            }
        }
        bool_result_final[0]++;
        if (parseInt(indexEsc) === parseInt(listaSesiones[idSesion].escenarios.length))
            bool_result_final[1] = true;
        var contFinal = [];

        for(key in contVotos){
            contFinal.push({name: key, y: contVotos[key]})
        }

        contFinal.stringify = JSON.stringify(contFinal);
        if (resultado_final.length < indexEsc){
            resultado_final.push(contFinal);
        }

        F = [];
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
                    if (parseInt(listaDecisiones[i].id) == parseInt(VotosporPar[idPart][dec])) {
                        aux2.push(listaDecisiones[i].nombre);
                        break;
                    }
                }
            }
            aux.push(aux2);

            F.push(aux);
        }
        console.log(F);
        console.log(resultado_final);
        res.render('resultadoEsc.html', {
            VotosporPart: F,
            probando: contFinal,
            username: req.params.username,
            idSesionEnc: req.params.idSesion,
            idPartEnc: req.params.idPart,
            indexEsc: indexEsc,
            creador: creador,
            inicio: listaSesiones[idSesion].inicio,
            result_final: bool_result_final[1],
            result_final_part: bool_result_final[2],
        });
    });

    app.post('/sesion/resultfinal/:idSesion/:indexEsc/:idPart/:username', function(req, res){
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        var idPart = parseInt(decrypt(String(req.params.idPart), crypto));
        var indexEsc = parseInt(req.params.indexEsc);
        var creador = false;
        if (parseInt(listaSesiones[idSesion].moderador) === parseInt(idPart)) {
            creador = true;
            console.log("SOYYYYYYYY POKIIIIIIIIII!");
        }
        resultado_final.stringify = JSON.stringify(resultado_final);
        res.render('resultadoFinal.html', {
            probando: resultado_final,
            username: req.params.username,
            idSesionEnc: req.params.idSesion,
            idPartEnc: req.params.idPart,
            indexEsc: indexEsc,
            creador: creador,
            inicio: listaSesiones[idSesion].inicio,
            result_final: bool_result_final[1]
        });
    });
}

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}