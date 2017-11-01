module.exports = function(sequelize, DataTypes) {
    var Sesion_esc = sequelize.define("Sesion_esc", {
    }, {
        classMethods: {
            associate: function(models) {
                Sesion_esc.belongsTo(models.Sesion,{primaryKey: true});
                Sesion_esc.belongsTo(models.Escenario,{primaryKey: true});

            }
        }
    });

    return Sesion_esc;
};