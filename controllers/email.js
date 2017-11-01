

module.exports = function (nodemailer,crypto,sesion,res, req) {

    if (req.user) {
        res.redirect('/sesion/moderador/esperando/'
            + encrypt(String(sesion.id), crypto)+'/'
            + encrypt(String(sesion.creador),crypto)
        );
    } else {
        res.redirect('/sesion/moderador/username/'
            + encrypt(String(sesion.id), crypto) + '/'
            + encrypt(String(sesion.creador), crypto)
        );
    }
};