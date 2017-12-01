var Sesion = require('../controllers/Sesion');
var Escenario = require('../controllers/Escenario');
var Invitado = require('../controllers/Invitado');
var Participante = require('../controllers/Participante');
var models  = require('../models');
var decrypt = require('../controllers/decrypt');
var encrypt = require('../controllers/encrypt');

module.exports = function(app, passport, nodemailer, crypto, listaSesiones,
                          listaDecisiones, logueados, resultado_por_escenario,
                          bool_result_final, resultado_final, resultados,jsontoxml
){

    app.get('/probandoChat', function(req, res) {
        res.render('probandoChat.html');
    });

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
            sesion: listaSesiones[parseInt(decrypt(req.params.idSesionEnc, crypto))],
            idSesionEnc: req.params.idSesionEnc
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

        res.redirect('/sesion/moderador/username/'
            + req.params.idSesionEnc + '/'
            + encrypt(String(listaSesiones[idSesion].creador), crypto)
        );
    });

    ///////////////////////// PANTALLA USERNAME ////////////////////////////////
    app.get('/sesion/moderador/username/:idSesionEnc/:emailInvEnc', function (req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        var emailInv = decrypt(req.params.emailInvEnc, crypto);
        listaSesiones[idSesion].url = '/sesion/mod/iniciando/' + req.params.idSesionEnc + '/' + req.params.emailInvEnc;
        if (req.isAuthenticated()) {
            logueados[req.user.id].enSesion = true;
            logueados[req.user.id].idSesion = idSesion;
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
        var moderador_guardado = false;
        var idSesion = parseInt(decrypt(req.params.idSesion, crypto));
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
                    inicio: listaSesiones[idSesion].inicio
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
                revisados: []
            });
        }
    });
    app.post('/sesion/mod/iniciando/:idSesion/:emailInv', function (req, res) {
        var names_conectados = [];
        var moderador_guardado = false;
        var idSesion = parseInt(decrypt(req.params.idSesion, crypto));
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
                    inicio: listaSesiones[idSesion].inicio
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
                revisados: []
            });
        }
    });

    app.post('/sesion/part/iniciando/:idSesion/:emailInv', function (req, res) {
        var names_conectados = [];
        var idSesion = parseInt(decrypt(req.params.idSesion, crypto));
        var emailInv = decrypt(req.params.emailInv, crypto);
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
                    revisados: []
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
                    revisados: []
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
        var indexEsc = parseInt(req.params.indexEsc);
        if (req.body.editar === "true") {
            indexEsc -= 1;
        }
        if (parseInt(listaSesiones[idSesion].moderador) === parseInt(idPart)) {
            nocreador = false;
        }
        var namePart = 0;
        bool_result_final[3] = true;
        for (var i = 0; i < listaSesiones[idSesion].participantes.length;i ++){
            console.log(parseInt(listaSesiones[idSesion].participantes[i].id), parseInt(idPart), listaSesiones[idSesion].participantes[i].username);
            if (parseInt(listaSesiones[idSesion].participantes[i].id) === parseInt(idPart)) {
                namePart = i;
            }
        }
        listaSesiones[idSesion].escenarios[indexEsc].cont++;
        listaSesiones[idSesion].IdxEscActual = indexEsc;
        listaSesiones[idSesion].inicio = true;
        listaSesiones[idSesion].escenarios.ver_resultado = false;
        var hr_finish = new Date().getTime();
        var tiempo_extra = hr_finish + 1000*60*10;
        hr_finish += 1000*60*60*listaSesiones[idSesion].escenarios[indexEsc].hh
            + 1000*60*listaSesiones[idSesion].escenarios[indexEsc].mm
            + 1000*listaSesiones[idSesion].escenarios[indexEsc].ss;
        ///////////////// AQUI GUARDARÉLOS VOTOS AHORA /////////////
        ///////////// TAMBIEN DEBERIA IR EN RESULTADO FINAL :) /////////////
        if (indexEsc !== 0 && req.body.editar === "false") {
            console.log("GUARDANDOOOOOOOOOOOOOOOOOOOO!!!");
            listaSesiones[idSesion].escenarios[indexEsc-1].votos.forEach(function(voto) {
                listaSesiones[idSesion].escenarios[indexEsc-1].crearVoto(voto.prioridad, voto.idDecision ,voto.idParticipante);
            });
        }
        models.Decision.findAll().then(function (decision) {
            var listaDecisionesXml={};
            for (d in decision){
                listaDecisionesXml['d'+d.toString()]={
                    id:decision[d].id,
                    nombre:decision[d].nombre,
                    mecanismo: decision[d].mecanismo,
                    resultado: decision[d].resultado};
            }
            listaDecisiones=decision;
            res.render('decisiones.html', {
                username: req.params.username,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesion,
                idPart: idPart,
                idPartEnc: req.params.idPart,
                indexEsc: indexEsc,
                dec: jsontoxml(JSON.stringify({decisiones:listaDecisionesXml})),
                esc: listaSesiones[idSesion].escenarios[indexEsc],
                hor: listaSesiones[idSesion].escenarios[indexEsc].hh,
                mi: listaSesiones[idSesion].escenarios[indexEsc].mm,
                se: listaSesiones[idSesion].escenarios[indexEsc].ss,
                hr_finish: hr_finish,
                n: listaSesiones[idSesion].escenarios[indexEsc].cont,
                nocreador: nocreador,
                namePart: namePart,
                tiempo_extra: tiempo_extra,
                editar: req.body.editar,
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
            //////// AQUI SE GUARDAN LOS VOTOS EN LA BASE DE DATOS ///////////
            //escenarioActual.crearVoto(req.body.prioridad[idDecision-1],idDecision,idPart);
            //////////// HAY QUE HACERLO EN OTRA PARTE GGWP /////////////
            //////////////////////////////////////////////////////////////////
            escenarioActual.votos.push({
                prioridad: req.body.prioridad[idDecision-1],
                idDecision: idDecision,
                idParticipante: idPart
            });
        });
        indexEsc = parseInt(indexEsc)+1;
        if (indexEsc <= listaSesiones[idSesion].escenarios.length) {
            res.render('mandarDecisiones.html', {
                username: req.params.username,
                idSesionEnc: req.params.idSesion,
                idPartEnc: req.params.idPart,
                indexEsc: indexEsc,
                inicio: listaSesiones[idSesion].inicio,
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
        var cant_dec = {};
        var cant_dec1 = {};
        var cant_dec2 = {};
        var cant_dec3 = {};
        var dec_aux = [];
        var dec_aux1 = [];
        var dec_aux2 = [];
        var dec_aux3 = [];
        var cant_dec_tot = [];
        var cant_dec1_tot = [];
        var cant_dec2_tot = [];
        var cant_dec3_tot = [];
        var dec_todos_alta = [];
        var dec_todos_media = [];
        var dec_todos_media_alta = [];
        var dec_todos_no_selec = [];
        var index = [];
        for(i = 0; i < listaDecisiones.length; i++) {
            contVotos[listaDecisiones[i].dataValues.id] = 0;
        }
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        var idPart = parseInt(decrypt(String(req.params.idPart), crypto));
        var indexEsc = parseInt(req.params.indexEsc);
        var votosEsc = listaSesiones[idSesion].escenarios[indexEsc-1].votos;
        var num_part = listaSesiones[idSesion].participantes.length;
        console.log("VER AQUI",votosEsc);

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
            VotosporPar[votosEsc[i].idParticipante].push([votosEsc[i].idDecision,votosEsc[i].prioridad]);
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
        resultados[indexEsc - 1] = F;

        for (Part in resultados[indexEsc-1])
        {
            for (dec in resultados[indexEsc-1][Part][1])
            {
                if (resultados[indexEsc-1][Part][1][dec][1] == "Alta")
                {
                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec) cant_dec[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec[resultados[indexEsc-1][Part][1][dec][0]] = 1;

                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec2) cant_dec2[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec2[resultados[indexEsc-1][Part][1][dec][0]] = 1;
                }
                if (resultados[indexEsc-1][Part][1][dec][1] == "Media")
                {
                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec1) cant_dec1[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec1[resultados[indexEsc-1][Part][1][dec][0]] = 1;

                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec2) cant_dec2[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec2[resultados[indexEsc-1][Part][1][dec][0]] = 1;
                }
                if (resultados[indexEsc-1][Part][1][dec][1] == "No Seleccionada")
                {
                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec3) cant_dec3[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec3[resultados[indexEsc-1][Part][1][dec][0]] = 1;

                }

            }
        }
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

        var Aux = [];
        for(key in cant_dec){
            Aux.push({name: key, y: cant_dec[key]})
        }
        cant_dec_tot.push(Aux);

        Aux = [];
        for(key in cant_dec1){
            Aux.push({name: key, y: cant_dec1[key]})
        }
        cant_dec1_tot.push(Aux);

        Aux = [];
        for(key in cant_dec2){
            Aux.push({name: key, y: cant_dec2[key]})
        }
        cant_dec2_tot.push(Aux);

        Aux = [];
        for(key in cant_dec3){
            Aux.push({name: key, y: cant_dec3[key]})
        }
        cant_dec3_tot.push(Aux);

        index.push(indexEsc-1);

        cant_dec_tot.stringify = JSON.stringify(cant_dec_tot);
        cant_dec1_tot.stringify = JSON.stringify(cant_dec1_tot);
        cant_dec2_tot.stringify = JSON.stringify(cant_dec2_tot);
        cant_dec3_tot.stringify = JSON.stringify(cant_dec3_tot);
        index.stringify = JSON.stringify(index);
        var names_conectados = [];
        for (var i = 0; i < listaSesiones[idSesion].conectados.length; i++) {
            if (listaSesiones[idSesion].conectados[i].username !== req.params.username)
                names_conectados.push(listaSesiones[idSesion].conectados[i].username);
        }
        res.render('resultadoEsc.html', {
            names: names_conectados,
            revisados: listaSesiones[idSesion].escenarios[indexEsc-1].revisados,
            probando1: cant_dec_tot,
            probando2: cant_dec1_tot,
            probando3: cant_dec2_tot,
            probando4: cant_dec3_tot,
            altas: dec_todos_alta,
            medias: dec_todos_media ,
            altas_medias: dec_todos_media_alta,
            VotosporPart: F,
            probando: contFinal,
            username: req.params.username,
            idSesion: idSesion,
            idSesionEnc: req.params.idSesion,
            idPartEnc: req.params.idPart,
            indexEsc: indexEsc,
            creador: creador,
            inicio: listaSesiones[idSesion].inicio,
            result_final: bool_result_final[1],
            result_final_part: bool_result_final[2],
            idx: index
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
        var cant_dec = {}; // = {dec1: 1, dec2: 3, dec3: 3} si num_part = 3, dec2 y dec3 van. Alta
        var cant_dec1 = {}; //Media
        var cant_dec2 = {}; //Media - Alta
        var cant_dec3 = {}; //No Selec
        var cant_dec_tot = []; // [[indexEsc1,cant_dec1],...]
        var cant_dec1_tot = [];
        var cant_dec2_tot = [];
        var cant_dec3_tot = [];
        var dec_aux = []; //dec que han sido votadas por todos, prioridad alta
        var dec_aux1 = []; //dec que han sido votadas por todos, prioridad media
        var dec_aux2 = []; //dec que han sido votadas por todos, prioridad alta-media
        var dec_aux3 = []; //dec que han sido votadas por todos, prioridad no selec
        var num_part = listaSesiones[idSesion].participantes.length;
        var esc = [];
        var index = [];

        /////////// GUARDANDO EN LA BD LOS VOTOS ///////////////
        if (indexEsc !== 0) {
            console.log("GUARDANDOOOOOOOOOOOOOOOOOOOO!!!");
            listaSesiones[idSesion].escenarios[indexEsc-1].votos.forEach(function(voto) {
                listaSesiones[idSesion].escenarios[indexEsc-1].crearVoto(voto.prioridad, voto.idDecision ,voto.idParticipante);
            });
        }

        console.log("AQUIIIIII",req.body.escenarios);
        if (req.body.escenarios === undefined) index.push("1");
        else index.push(req.body.escenarios);
        for (var i = 0; i < listaSesiones[idSesion].escenarios.length; i++)
        {
            esc.push(i+1);
        }

        /*  resultados={"0": F_1,"1"; F_2,..}
            F_n=[[nombrePart1,[[dec1,prioridad],[dec2,prioridad],...]],
                [nombrePart2,[[dec1,prioridad],[dec2,prioridad],...]]]*/

        for (idx in resultados)
        {
            cant_dec = {};
            cant_dec1 = {};
            cant_dec2 = {};
            cant_dec3 = {};
            dec_aux = [];
            dec_aux1 = [];
            dec_aux2 = [];
            dec_aux3 = [];
            for (Part in resultados[idx])
            {
                for (dec in resultados[idx][Part][1])
                {
                    if (resultados[idx][Part][1][dec][1] == "Alta")
                    {
                        if (resultados[idx][Part][1][dec][0] in cant_dec) cant_dec[resultados[idx][Part][1][dec][0]]++;
                        else cant_dec[resultados[idx][Part][1][dec][0]] = 1;

                        if (resultados[idx][Part][1][dec][0] in cant_dec2) cant_dec2[resultados[idx][Part][1][dec][0]]++;
                        else cant_dec2[resultados[idx][Part][1][dec][0]] = 1;
                    }
                    if (resultados[idx][Part][1][dec][1] == "Media")
                    {
                        if (resultados[idx][Part][1][dec][0] in cant_dec1) cant_dec1[resultados[idx][Part][1][dec][0]]++;
                        else cant_dec1[resultados[idx][Part][1][dec][0]] = 1;

                        if (resultados[idx][Part][1][dec][0] in cant_dec2) cant_dec2[resultados[idx][Part][1][dec][0]]++;
                        else cant_dec2[resultados[idx][Part][1][dec][0]] = 1;
                    }
                    if (resultados[idx][Part][1][dec][1] == "No Seleccionada")
                    {
                        if (resultados[idx][Part][1][dec][0] in cant_dec3) cant_dec3[resultados[idx][Part][1][dec][0]]++;
                        else cant_dec3[resultados[idx][Part][1][dec][0]] = 1;
                    }

                }
            }
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

            var aux = [];
            for(key in cant_dec){
                aux.push({name: key, y: cant_dec[key]})
            }
            cant_dec_tot.push(aux);

            aux = [];
            for(key in cant_dec1){
                aux.push({name: key, y: cant_dec1[key]})
            }
            cant_dec1_tot.push(aux);

            aux = [];
            for(key in cant_dec2){
                aux.push({name: key, y: cant_dec2[key]})
            }
            cant_dec2_tot.push(aux);

            aux = [];
            for(key in cant_dec3){
                aux.push({name: key, y: cant_dec3[key]})
            }
            cant_dec3_tot.push(aux);



        }
        if (parseInt(listaSesiones[idSesion].moderador) === parseInt(idPart)) {
            creador = true;
        }
        cant_dec_tot.stringify = JSON.stringify(cant_dec_tot);
        cant_dec1_tot.stringify = JSON.stringify(cant_dec1_tot);
        cant_dec2_tot.stringify = JSON.stringify(cant_dec2_tot);
        cant_dec3_tot.stringify = JSON.stringify(cant_dec3_tot);
        dec_todos_alta.stringify = JSON.stringify(dec_todos_alta);
        dec_todos_media.stringify = JSON.stringify(dec_todos_media);
        dec_todos_media_alta.stringify = JSON.stringify(dec_todos_media_alta);
        index.stringify = JSON.stringify(index);


        resultado_final.stringify = JSON.stringify(resultado_final);
        res.render('resultadoFinal.html', {
            probando: cant_dec_tot,
            probando1: cant_dec1_tot,
            probando2: cant_dec2_tot,
            probando3: cant_dec3_tot,
            cant_dec: cant_dec,
            todos_alta: dec_todos_alta,
            todos_media: dec_todos_media,
            todos_media_alta: dec_todos_media_alta,
            res_final: resultado_final,
            username: req.params.username,
            idSesionEnc: req.params.idSesion,
            idPartEnc: req.params.idPart,
            indexEsc: indexEsc  ,
            creador: creador,
            inicio: listaSesiones[idSesion].inicio,
            result_final: bool_result_final[1],
            esc: esc,
            idx: index
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