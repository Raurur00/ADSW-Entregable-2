var Escenario = require('../controllers/Escenario');
var Invitado = require('../controllers/Invitado');
var decrypt = require('../controllers/decrypt');
var encrypt = require('../controllers/encrypt');

module.exports = function (app,nodemailer,crypto,listaSesiones) {
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
};