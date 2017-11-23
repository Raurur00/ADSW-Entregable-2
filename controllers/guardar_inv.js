var models  = require('../models');

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
        );
        models.Sesion_user.create({
            ParticipanteId: resultado1.id,
            SesionId: idSesion
        }).then(function(resultado2){
            console.log(resultado2);
        });
    });
    return id;
}