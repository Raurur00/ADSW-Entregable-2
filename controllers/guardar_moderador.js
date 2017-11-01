var models  = require('../models');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'mariobros1'
});

connection.query('USE proyecto');

module.exports = function(req, sesion, idSesion, registrado) {
    if (registrado) {
        sesion.creador = req.user.id;
        models.Sesion_user.create({
            ParticipanteId: req.user.id,
            SesionId: idSesion,
        }).then(function(resultado){
            console.log('sesion_user',resultado);
        });
        models.Sesion.update({
            ParticipanteId: req.user.id
        },{
            where: {id: idSesion}
        }).then(function(result){
            console.log('update', result);
        })

    } else {
        console.log("FSDFADSFADS", idSesion);
        models.Participante.create({
            username: req.body.username,
            registrado: false
        }).then(function(resultado1){
            console.log('participante', resultado1);
            sesion.creador = resultado1.id;
            models.Sesion.update(
                {ParticipanteId: resultado1.id},
                {where: {id: idSesion}}
            ).then(function(result) {
                console.log('update',result);
            });
            models.Sesion_user.create({
                ParticipanteId: resultado1.id,
                SesionId: idSesion
            }).then(function(resultado2){
                console.log('sesion_user',resultado2);
            });
        });
    }
}