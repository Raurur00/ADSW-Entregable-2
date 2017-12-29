var models  = require('../models');
var Sequelize = require('sequelize');
module.exports=function(titulo,descrip,moderador) {
    this.titulo=titulo;
    this.descrip=descrip;
    this.moderador=moderador;
    this.activada= false;
    this.invitados= [];
    this.participantes=[];
    this.escenarios= [];
    this.id= null;
    this.creador=false;
    this.url= '/';
    this.username= false;
    this.conectados= [];
    this.inicio = false;
    this.IdxEscActual = 0;
    this.english = false;
    this.votosGuardados = false;
    this.resultados = {};
    this.resultado_final = [];
    this.bool_result_final = [-1,false, false, true];

    this.crearSesion=function (resolve) {
        models.Sesion.create({
            titulo: this.titulo,
            descripcion: this.descrip,
            ParticipanteId: this.moderador
        }).then(function (result) {
            return resolve(result.id);
        });
    };

    this.crearEscenarios=function () {
        this.escenarios.forEach(function(esc) {
            esc.crearEscenario();
        });
    };

    this.sesionesFunc = function(idSesion, resolve) {
        models.Sesion_esc.findAll({
            where: {
                SesionId: idSesion
            }
        }).then(function(data) {
            resolve(data);
        });
    }

    this.votosFunc = function(idsEsc, resolve) {
        models.Voto.findAll({
            where: Sequelize.or({
                idEsc: idsEsc
            })
        }).then(function(data) {
            return resolve(data);
        });
    }

    this.escenariosFunc = function(idsEsc, resolve) {
        models.Escenario.findAll({
            where: Sequelize.or({
                id: idsEsc
            })
        }).then(function(data) {
            return resolve(data);
        });
    }


};