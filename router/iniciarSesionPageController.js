var Sesion = require('../controllers/Sesion');
var encrypt = require('../controllers/encrypt');
module.exports = function (app,crypto,listaSesiones) {
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

    app.get('/vista', function(req, res) {
        res.render('probandoVista.html');
    })
};