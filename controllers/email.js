var ip = require('ip');

module.exports = function (nodemailer,crypto,sesion,res, req) {
    var smtpTransport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        auth: {
            user: "i.t.force.76@gmail.com",
            pass: "mariobros1"
        }
    });
    var encrypt = require('../controllers/encrypt');
    sesion.invitados.forEach(function (invitado) {
        var url = 'http://'+ip.address()+':3000/sesion/username/'
            + encrypt(String(sesion.id), crypto)+'/'
            + encrypt(String(invitado),crypto);
        var mailOptions = {
            to: invitado,
            subject: 'Invitacion a una sesion',
            text: url
        };
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                res.end("error");
            } else {
                console.log("Message sent: " + response.message);
                res.end("sent");
            }
        });
    });
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