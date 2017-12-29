var Participante = require('../controllers/Participante');
var decrypt = require('../controllers/decrypt');
var encrypt = require('../controllers/encrypt');
module.exports = function (app,crypto,listaSesiones) {
    app.get('/sesion/moderador/username/:idSesionEnc/:emailInvEnc', function (req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        var emailInv = decrypt(req.params.emailInvEnc, crypto);
        var moderador_guardado = false;
        var buttonText = "Iniciar juego!";
        var url = '/sesion/moderador/username/' + req.params.idSesionEnc + '/' + req.params.emailInvEnc;
        if (req.body.english == "true") buttonText = "Start Game!";
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
                    en: req.body.english,
                    buttonText: buttonText,
                    url: url
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
                    en: req.body.english,
                    buttonText: buttonText,
                    url: url
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
        var buttonText = "Start Game!";
        var url = '/sesion/moderador/username/' + req.params.idSesionEnc + '/' + req.params.emailInvEnc ;
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
                    en: "true",
                    buttonText: buttonText,
                    url: url
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
                    en: "true",
                    buttonText: buttonText,
                    url: url
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
                en: "true"
            });
        }
    });

    app.post('/sesion/moderador/username/:idSesionEnc/:emailInvEnc', function (req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesionEnc), crypto));
        var buttonText = "Iniciar juego!";
        if (req.body.english == "true") buttonText = "Start Game!";
        var emailInv = decrypt(req.params.emailInvEnc, crypto);
        var moderador_guardado = false;
        var url = '/sesion/moderador/username/' + req.params.idSesionEnc + '/' + req.params.emailInvEnc;
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
                    en: req.body.english,
                    buttonText: buttonText,
                    url: url
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
                    en: req.body.english,
                    buttonText: buttonText,
                    url: url
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
        listaSesiones[idSesion].url = '/sesion/esperando/' + req.params.idSesionEnc + '/' + req.params.emailInvEnc;
        var bool = true;
        var url = '/sesion/username/' + req.params.idSesionEnc + '/' + req.params.emailInvEnc;
        var buttonText = "Iniciar juego!";
        if (req.body.english == "true") buttonText = "Start Game!";
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
                        en: req.body.english,
                        buttonText: buttonText,
                        url: url
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
                    en: req.body.english,
                    buttonText: buttonText,
                    url: url
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
        var buttonText = "Iniciar juego!";
        if (req.body.english == "true") buttonText = "Start Game!";
        var url = '/sesion/username/' + req.params.idSesionEnc + '/' + req.params.emailInvEnc;
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
                        en: req.body.english,
                        buttonText: buttonText,
                        url: url
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
                    en: req.body.english,
                    buttonText: buttonText,
                    url: url
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
};