module.exports = function(sequelize, DataTypes) {
    var Voto = sequelize.define("Voto", {
    }, {
        classMethods: {
            associate: function(models) {
                Voto.belongsTo(models.Participante,{primaryKey: true});
                Voto.belongsTo(models.Decision,{primaryKey: true});
                Voto.belongsTo(models.Escenario,{primaryKey: true});
            }
        }
    });
    return Voto;
};