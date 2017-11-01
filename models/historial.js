module.exports = function(sequelize, DataTypes) {
    var Historial = sequelize.define("Historial", {
        votos: DataTypes.INTEGER
    }, {
        classMethods: {
            associate: function(models) {
                Historial.belongsTo(models.Escenario,{primaryKey: true});
                Historial.belongsTo(models.Decision,{primaryKey: true});
            }
        }
    });
    return Historial;
};