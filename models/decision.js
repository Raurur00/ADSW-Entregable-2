module.exports = function(sequelize, DataTypes) {
    var Decision = sequelize.define("Decision", {
        nombre: DataTypes.STRING,
        mecanismo: DataTypes.STRING,
        resultado: DataTypes.STRING
        }, {
        classMethods: {
            associate: function(models) {
                Decision.hasMany(models.Voto);
            }
        }
    });
    return Decision;
};