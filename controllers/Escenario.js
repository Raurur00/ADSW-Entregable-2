var models  = require('../models');
module.exports = function Escenario(objetivo,hh,mm,ss,sesionID){
    this.objetivo=objetivo;
    this.hh=hh;
    this.mm=mm;
    this.ss=ss;
    this.cont = 0;
    this.sesionID=sesionID;
    this.id=null;
    this.votos = [];
    this.revisados = [];
    this.ver_resultado = false;
    this.hr_finish = 0; //tiempo agregado antes de que timer sea 0
    this.hr_finish2 = 0; //tiempo de termino, cuando el timer ya es 0
    this.flag = 1;
    this.enviar_decisiones = false;

    this.crearEscenario = function(resolve){
        models.Escenario.create({
            objetivo: this.objetivo,
            hh: this.hh,
            mm: this.mm,
            ss: this.ss
        }).then(function(result) {
            /*this.id = result.id;
            models.Sesion_esc.create({
                EscenarioId: result.id,
                SesionId: this.sesionID
            });*/
            return resolve(result.id);
        });
    };

    this.crearSesionEsc = function() {
        models.Sesion_esc.create({
            EscenarioId: this.id,
            SesionId: this.sesionID
        });
    };

    this.crearVoto = function(prioridad, idDecision,idParticipante, username){
        models.Voto.create({
            prioridad: prioridad,
            idDec: idDecision,
            idEsc: this.id,
            idPart: idParticipante,
            username: username
        })
    };
};