var models  = require('../models');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'mariobros1'
});

connection.query('USE proyecto');
module.exports = function(voto, req, res) {
    models.Voto.create({
        DecisionId: '1',
        EscenarioId: req.params.idEscenario,
        ParticipanteId: req.params.idParticipante,
    }).then(function(result){
        voto.id = result.id;
    });
}

//funcion pa recibiar decisiones marcadas con get