module.exports = function(sequelize, DataTypes) {
    var Chat = sequelize.define("Chat", {
    }, {
        classMethods: {
            associate: function(models) {
                Chat.belongsTo(models.Sesion,{primaryKey: true});
                Chat.belongsTo(models.Mensaje,{primaryKey: true});
            }
        }
    });
    return Chat;
};