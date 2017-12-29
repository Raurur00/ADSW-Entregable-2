var Participante = require('../controllers/Participante');
var decrypt = require('../controllers/decrypt');
var encrypt = require('../controllers/encrypt');
module.exports = function (app,crypto,listaSesiones) {
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
                    buttonText: buttonText,
                    url: url
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
                buttonText: buttonText,
                url: url
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
};