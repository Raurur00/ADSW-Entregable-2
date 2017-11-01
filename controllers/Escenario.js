module.exports = function Escenario(objetivo,hh,mm,ss,sesionID){
    this.objetivo=objetivo;
    this.hh=hh;
    this.mm=mm;
    this.ss=ss;
    this.sesionID=sesionID;
    this.id=null;

    this.crearEscenario = function(){
        models.Escenario.create({
            objetivo: this.objetivo,
            hh: this.hh,
            mm: this.mm,
            ss: this.ss
        }).then(function(result) {
            this.id = result.id;
            models.Sesion_esc.create({
                EscenarioId: result.id,
                SesionId: this.sesionID
            });
        });
    };
};