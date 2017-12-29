module.exports = function(sequelize, DataTypes) {
    var Voto = sequelize.define("Voto", {
        idPart: {type: DataTypes.INTEGER, primaryKey: true},
        idEsc: {type: DataTypes.INTEGER, primaryKey: true},
        idDec: {type: DataTypes.INTEGER, primaryKey: true},
        username: DataTypes.STRING,
        prioridad: DataTypes.STRING
    }, {
    });
    return Voto;
};

