var models  = require('../models');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'mariobros1'
});

connection.query('USE proyecto');

module.exports = function(idSesion, req) {
    models.Sesion_user.create({
        ParticipanteId: req.user.id,
        SesionId: idSesion
    }).then(function(resultado){
        console.log(resultado);
    });
}