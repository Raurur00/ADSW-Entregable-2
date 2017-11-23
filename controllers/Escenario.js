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

    this.crearVoto = function(idDecision,idParticipante){
        models.Voto.create({
            DecisionId: idDecision,
            EscenarioId: this.id,
            ParticipanteId: idParticipante
        });
    };
};