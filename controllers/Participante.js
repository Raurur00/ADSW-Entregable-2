var models  = require('../models');
module.exports=function(email, username, password, registrado) {
    this.email=email;
    this.username = username;
    this.password = password;
    this.registrado = registrado;
    this.id = null;
    this.crearParticipante = function (resolve) {
        console.log("USERNAMEEEE: ", this.username);
        models.Participante.create({
            email : this.email,
            username: this.username,
            password: this.password,
            registrado: this.registrado
        }).then(function(result) {
            return resolve(result.id);
        });
    };

    this.crearSesionUser = function (idSesion)  {
        models.Sesion_user.create({
            ParticipanteId: this.id,
            SesionId: idSesion,
        });
    };

    this.guardarModerador = function (idSesion) {
        models.Sesion.update({
            ParticipanteId: this.id
        },{
            where: {id: idSesion}
        });
    }

};