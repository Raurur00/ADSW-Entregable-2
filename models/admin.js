module.exports = function(sequelize, DataTypes) {
    var Admin = sequelize.define("Admin", {
        username: {type: DataTypes.STRING, primaryKey: true},
        pass: DataTypes.STRING
    }, {
    });
    return Admin;
};