var models  = require('../models');
module.exports=function(email, username, password, registrado) {
    this.email=email;
    this.username = username;
    this.password = password;
    this.registrado = registrado;

    this.crearParticipante = function(resolve) {
        models.Participante.create({
            email : this.email,
            usename: null,
            password: null,
            registrado: false
        }).then(function(result) {
            return resolve(result.id);
        });
    };
};