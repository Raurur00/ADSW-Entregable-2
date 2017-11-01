module.exports = function(sequelize, DataTypes) {
    var Mensaje = sequelize.define("Mensaje", {
        mensaje: DataTypes.STRING,
        username: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Mensaje.hasMany(models.Chat)
            }
        }
    });
    return Mensaje;
};