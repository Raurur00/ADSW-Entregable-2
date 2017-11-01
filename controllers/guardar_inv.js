var models  = require('../models');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'mariobros1'
});

connection.query('USE proyecto');

module.exports = function(idSesion, emailInv, username) {
    var id;
    models.Participante.create({
        username: username,
        registrado: false
    }).then(function(resultado1){
        id = resultado1.id;
        models.Sesion.update(
            {ParticipanteId: resultado1.id},
            {where: {id: idSesion}}
        ).then(function(result) {
            console.log(result, ':((((((((((((((');
        });
        models.Sesion_user.create({
            ParticipanteId: resultado1.id,
            SesionId: idSesion
        }).then(function(resultado2){
            console.log(resultado2);
        });
    });
    return id;
}