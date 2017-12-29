var models  = require('../models');
module.exports = function (app) {
    app.get('/homeAdmin', function (req, res) {
        if(req.isAuthenticated()){
            var listaDecisiones;
            models.Decision.findAll().then(function (decision) {
                listaDecisiones = decision;
                res.render('adminHome.html', {
                    success: req.flash('success'),
                    error: req.flash('error'),
                    dec: listaDecisiones
                });
            });
        } else {
            res.redirect("/");
        }
    });

    app.get('/agregarDecision',function(req,res){
        if(req.isAuthenticated()){
            models.Decision.findAll().then(function (decision) {
                res.render('agregarDecision.html', {
                    success: req.flash('success'),
                    error: req.flash('error')
                });
            });
        } else {
            res.redirect("/");
        }
    });
    app.post('/agregarDecision',function(req,res){
        models.Decision.create({
            nombre: req.body.nombre,
            mecanismo: req.body.mecanismo,
            resultado: req.body.resultado
        }).then(function (result) {
            res.redirect('/homeAdmin');
        });
    });

    app.post('/eliminarDecision',function(req,res){
        models.Decision.findById(req.body.id)
            .then(function (result) {
                result.destroy({force:true});
                res.redirect('/homeAdmin');
            });
    });
    app.post('/editarDec',function(req,res){
       res.render('editarDecision.html',{idDecision:req.body.id});
    });
    app.post('/editarDecision',function(req,res){
        models.Decision.findById(req.body.id)
            .then(function (result) {
                result.update({
                    nombre:req.body.nombre,
                    mecanismo:req.body.mecanismo,
                    resultado:req.body.resultado
                });
            })
            .then(function(result){
                res.redirect('/homeAdmin');
            });
    });
};