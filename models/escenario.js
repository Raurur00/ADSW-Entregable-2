module.exports = function(sequelize, DataTypes) {
    var Escenario = sequelize.define("Escenario", {
        objetivo: DataTypes.STRING,
        hh: DataTypes.INTEGER,
        mm: DataTypes.INTEGER,
        ss: DataTypes.INTEGER
    }, {
        classMethods: {
            associate: function(models) {
                Escenario.hasMany(models.Sesion_esc);
            }
        }
    });
    return Escenario;
};