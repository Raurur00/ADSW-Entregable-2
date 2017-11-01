module.exports = function(sequelize, DataTypes) {
    var Sesion_user = sequelize.define("Sesion_user", {
    }, {
        classMethods: {
            associate: function(models) {
                Sesion_user.belongsTo(models.Sesion,{primaryKey: true});
                Sesion_user.belongsTo(models.Participante,{primaryKey: true});
            }
        }
    });

    return Sesion_user;
};