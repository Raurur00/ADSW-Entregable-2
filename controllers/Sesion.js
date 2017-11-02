var models  = require('../models');
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
    }
};