module.exports = function(app, passport, nodemailer, crypto, listaSesiones) {
    require('./homePageController')(app);
    require('./loginPageController')(app,passport);
    require('./iniciarSesionPageController')(app,crypto,listaSesiones);
    require('./crearSesionPageController')(app,nodemailer,crypto,listaSesiones);
    require('./pantallaUsernamePageController')(app,crypto,listaSesiones);
    require('./pantallaEsperaPageController')(app,crypto,listaSesiones);
    require('./EscenariosPageController')(app,crypto,listaSesiones);
    //require('./mandarDecisionesPageController')(app,crypto,listaSesiones,listaDecisiones);
    require('./historialPageController')(app, crypto);
    require('./adminHomePageController')(app);
};