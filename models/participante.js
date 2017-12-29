"use strict";

module.exports = function(sequelize, DataTypes) {
    var Participante = sequelize.define("Participante", {
        email: DataTypes.STRING,
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        registrado: DataTypes.BOOLEAN
    }, {
        classMethods: {
            associate: function(models) {
                Participante.hasMany(models.Sesion_user);
                Participante.hasMany(models.Sesion);
            }
        }
    });
    return Participante;
};