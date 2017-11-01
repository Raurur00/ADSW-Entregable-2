module.exports = function(sequelize, DataTypes) {
    var Sesion = sequelize.define("Sesion", {
        titulo: DataTypes.STRING,
        descripcion: DataTypes.STRING,
        fecha_fin: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Sesion.hasMany(models.Sesion_user);
                Sesion.hasMany(models.Sesion_esc);
                Sesion.hasMany(models.Chat);
                Sesion.belongsTo(models.Participante);
            }
        }
    });
    return Sesion;
};