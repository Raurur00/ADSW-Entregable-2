var models  = require('../models');
var Sequelize = require('sequelize');
module.exports=function(email, username, password, registrado) {
    this.email=email;
    this.username = username;
    this.password = password;
    this.registrado = registrado;
    this.id = null;
    this.hr_finish = -1; //hora termino de editar sus decisiones
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

    this.eliminarNoLogueados = function (idSesion) {

    };

    this.historial = function(idPart, resolve) {
        models.Sesion_user.findAll({
            where: {
                ParticipanteId: idPart
            }
        }).then(function(data){
            var ids = [];
            data.forEach(function(sesionUser) {
                ids.push(sesionUser.SesionId);
            });
            return resolve(ids);
        });
    };

    this.historial2 = function(ids, resolve) {
        models.Sesion.findAll({
            where: Sequelize.or({
                id: ids
            })
        }).then(function(data){
            return resolve(data);
        });
    }

};