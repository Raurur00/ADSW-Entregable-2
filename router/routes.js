var Sesion = require('../controllers/Sesion');
var Escenario = require('../controllers/Escenario');
var Invitado = require('../controllers/Invitado');
var Participante = require('../controllers/Participante');
var models  = require('../models');
var decrypt = require('../controllers/decrypt');
var encrypt = require('../controllers/encrypt');

module.exports = function(app, passport, nodemailer, crypto, listaSesiones, listaDecisiones, logueados, resultado_por_escenario, bool_result_final, resultado_final) {

    app.get('/', function (req, res) {
        res.render('index');
    });
    //////////////////////////LOGIN///////////////////////////////////////
    app.get('/login', function (req, res) {
        res.render('login', {message: req.flash('loginMessage'), sesionActivada: false});
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/signup', function (req, res) {
        res.render('signup', {message: req.flash('signupMessage')});
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/', // redirect to the secure profiles.handlebars section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
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
        req.checkBody('titulo', 'el titulo es o b l i g a t o r i o').notEmpty();
        req.checkBody('descrip', 'la descripción es o b l i g a t o r i a').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.render('index', {errors: errors, titulo: req.body.titulo, descrip: req.body.descrip});
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
        res.render('sesion/crear_sesion', {
            sesion: listaSesiones[parseInt(decrypt(req.params.idSesionEnc, crypto))],
            idSesionEnc: req.params.idSesionEnc
        });
    });

    app.post('/crear_sesion/invitar/:idSesionEnc', function (req, res) {
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        var errors = req.validationErrors();
        var repetido = false;
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        listaSesiones[idSesion].invitados.forEach(function (invitado) {
            if (invitado.toString() === req.body.email.toString()) {
                repetido = true;
                return;
            }
        });
        if (repetido) {
            res.render('sesion/crear_sesion', {
                sesion: listaSesiones[idSesion],
                repetido: true,
                idSesionEnc: req.params.idSesionEnc
            });
            return;
        }
        if (req.user) {
            if (req.user.email.toString() === req.body.email.toString()) {
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
            invitado = new Invitado(req.body.email);
            listaSesiones[idSesion].invitados.push(invitado);
        }
        res.render('sesion/crear_sesion', {
            errors: errors,
            sesion: listaSesiones[idSesion],
            idSesionEnc: req.params.idSesionEnc
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
            res.render('sesion/crear_sesion', {
                errors: errors,
                sesion: listaSesiones[idSesion],
                notiempo: true,
                idSesionEnc: req.params.idSesionEnc
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
            res.render('sesion/crear_sesion', {
                errors: errors,
                sesion: listaSesiones[idSesion],
                escrepetido: true,
                idSesionEnc: req.params.idSesionEnc
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
                res.render('sesion/crear_sesion', {
                    errors: errors,
                    sesion: listaSesiones[idSesion],
                    idSesionEnc: req.params.idSesionEnc
                });
            });
        } else {
            res.render('sesion/crear_sesion', {
                errors: errors,
                sesion: listaSesiones[idSesion],
                idSesionEnc: req.params.idSesionEnc
            });
        }
    });

    /////////////enviar invitaciones//////////////
    app.post('/crear_sesion/:idSesionEnc', function (req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        if (listaSesiones[idSesion].invitados.length === 0 && listaSesiones[idSesion].escenarios.length === 0) {
            res.render('sesion/crear_sesion', {
                sesion: listaSesiones[idSesion],
                noinv: true,
                noesc: true,
                idSesionEnc: req.params.idSesionEnc
            });
            return;
        }
        else if (listaSesiones[idSesion].invitados.length === 0) {
            res.render('sesion/crear_sesion', {
                sesion: listaSesiones[idSesion],
                noinv: true,
                idSesionEnc: req.params.idSesionEnc
            });
            return;
        }
        else if (listaSesiones[idSesion].escenarios.length === 0) {
            res.render('sesion/crear_sesion', {
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
            console.log("estoy en username del mod en get en logueado: ", listaSesiones[idSesion].participantes);
            res.render('sesion/esperando', {
                noresultado: true,
                username: req.user.username,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesionEnc,
                creador: true,
                idPart: req.user.id,
                idPartEnc: encrypt(String(req.user.id), crypto),
                indexEsc: 0,
                inicio: listaSesiones[idSesion].inicio
            });
        } else {
            console.log("estoy en username del mod en get sin loguear: ", listaSesiones[idSesion].participantes);
            res.render('sesion/username', {
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
            console.log("estoy en username del part en get en logueado: ", listaSesiones[idSesion].participantes);
            res.render('sesion/esperando', {
                noresultado: true,
                username: req.user.username,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesionEnc,
                creador: false,
                idPart: req.user.id,
                idPartEnc: encrypt(String(req.user.id), crypto),
                indexEsc: 0,
                inicio: listaSesiones[idSesion].inicio
            });
        } else {
            console.log("estoy en username del part en get sin loguear: ", listaSesiones[idSesion].participantes);
            res.render('sesion/username', {
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
            console.log("estoy en iniciando del mod en get sin loguear: ", listaSesiones[idSesion].participantes);
            res.render('sesion/esperando', {
                noresultado: true,
                username: part.username,
                emailInv: part.email,
                emailInvEnc: req.params.emailInv,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesion,
                creador: true,
                idPart: part.id,
                idPartEnc: encrypt(String(part.id), crypto),
                indexEsc: 0
            });
        });
    });
    app.post('/sesion/mod/iniciando/:idSesion/:emailInv', function (req, res) {
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
            console.log("estoy en iniciando del mod en post sin loguear: ", listaSesiones[idSesion].participantes);
            res.render('sesion/esperando', {
                noresultado: true,
                username: part.username,
                emailInv: part.email,
                emailInvEnc: req.params.emailInv,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesion,
                creador: true,
                idPart: part.id,
                idPartEnc: encrypt(String(part.id), crypto),
                indexEsc: 0
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
                console.log("estoy en iniciando del part en post sin loguear: ", listaSesiones[idSesion].participantes);
                res.render('sesion/esperando', {
                    noresultado: true,
                    username: part.username,
                    idSesion: idSesion,
                    idSesionEnc: req.params.idSesion,
                    creador: false,
                    idPart: part.id,
                    idPartEnc: encrypt(String(part.id), crypto),
                    indexEsc: 0,
                    inicio: listaSesiones[idSesion].inicio
                });
            });
        }   else {
            res.render('sesion/esperando', {
                noresultado: true,
                username: req.body.username,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesion,
                creador: false,
                idPart: null,
                idPartEnc: null,
                indexEsc: 0,
                inicio: listaSesiones[idSesion].inicio
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
        models.Decision.findAll().then(function (decision) {
            listaDecisiones=decision;
            res.render('decisiones', {
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
        res.render('sesion/mandar_decisiones',
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
            res.render('sesion/esperando', {
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
        console.log(resultado_final);
        res.render('sesion/resultado_esc', {
            probando: contFinal,
            username: req.params.username,
            idSesionEnc: req.params.idSesion,
            idPartEnc: req.params.idPart,
            indexEsc: indexEsc,
            creador: creador,
            inicio: listaSesiones[idSesion].inicio,
            result_final: bool_result_final[1],
            result_final_part: bool_result_final[2]
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
        res.render('sesion/resultado_final', {
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