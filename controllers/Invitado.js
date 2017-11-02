var ip = require('ip');
var encrypt = require('../controllers/encrypt');
module.exports=function(email) {
    this.email=email;
    this.enviarEmail = function(smtpTransport,crypto,idSesionEnc,res){
        var url = 'http://'+ip.address()+':3000/sesion/username/'
            + idSesionEnc +'/'
            + encrypt(String(this.email),crypto);
        var mailOptions = {
            to: this.email,
            subject: 'Invitación a una sesión',
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
    };
};