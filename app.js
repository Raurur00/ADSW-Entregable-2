var express = require('express');
var ip = require('ip');
var bodyParser = require('body-parser');
var path = require('path');
var models = require("./models/index.js");
var passport = require('passport');
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var expressValidator = require('express-validator');
var nodemailer = require("nodemailer");
var crypto = require('crypto');
var lista_sockets = {};
//var resultados = {};
var listaSesiones={};


//var logueados = {};
//var resultado_por_escenario = {};
//var resultado_final = [];
/*var bool_result_final = [-1,false, false, true]; [0] index del grafico por escenario
                                             [1] cargar a la pagina de result final,
                                             [2] que los part puedan ir a result final
                                             [3] que no se vuelvan a cargar resultados al
                                              recargar la pagina
                                              [4] juntar los graficos*/
// Init App
var app = express();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);

//Express
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

// Set Static Folder
app.use(express.static(path.join(__dirname, '')));


// required for passport
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());


// Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
            , root    = namespace.shift()
            , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});


var nodeadmin = require('nodeadmin');
app.use(nodeadmin(app));


//Routes
require('./router/index.js')(app, passport, nodemailer, crypto, listaSesiones);
require('./config/passport')(passport); // pass passport for configuration
app.use('/api', require('./router/api'));

app.locals = {
    olakease: "olakease",
    listaSesiones: listaSesiones
};

//Start Server
models.sequelize.sync().then(function () {
	var server = app.listen(3000, function () {
		var host = ip.address();
		var port = server.address().port;
		console.log('Example app listening at http://%s:%s', host, port);
	});
    var io = require('socket.io')(server);

    io.on('connection', function (socket) {
        socket.on('disconnect', function(data){
           console.log(socket.id, socket.username, "SE DESCONECTO");
        });

        socket.on('iniciando',function (data){
            io.sockets.emit('iniciando', data);
        });

        socket.on('sig',function (data){
            console.log("AQUI VA EL SIG DE LA SESION: ", data.sesion);
            io.sockets.emit('sig', data);
        });

        socket.on('final',function (data){
            console.log("AQUI VA EL FIN DE LA SESION: ", data.sesion);
            io.sockets.emit('final', data);
        });

        socket.on('votos', function(data) {
            io.sockets.emit('votos', data);
        });

        socket.on('grafico', function (data) {
            io.sockets.emit('grafico', data);
        });

        socket.on('estadisticas', function (data) {
            io.sockets.emit('estadisticas', data);
        });

        socket.on('online', function (data) {
            io.sockets.emit('online', data);
        });
        socket.on('chat', function (data) {
            io.sockets.emit('chat', data);
        });
        socket.on('iniciar', function (data) {
            require('./controllers/timer')(listaSesiones[data.idSesion].escenarios[listaSesiones[data.idSesion].IdxEscActual].hh,
                listaSesiones[data.idSesion].escenarios[listaSesiones[data.idSesion].IdxEscActual].mm,
                listaSesiones[data.idSesion].escenarios[listaSesiones[data.idSesion].IdxEscActual].ss,
                data.idSesion, data.indexEsc, listaSesiones, io);
        });
        socket.on('time_over', function (data){
            io.sockets.emit('time_over',data);
        });
        socket.on('enviar_decisiones', function (data){
            listaSesiones[data.sesion].escenarios[data.indexEsc].enviar_decisiones = true;
            console.log("ENVIAR TODAS LAS DECISIONES DE LA SESION ", data.sesion);
            io.sockets.emit('enviar_decisiones', data);
        });
        socket.on('pedir_tiempo', function (data){
            for (var i = 0; i < listaSesiones[data.idSesion].participantes.length; i++)
                if (listaSesiones[data.idSesion].participantes[i].id == data.idPart)
                {
                    data.idPart = listaSesiones[data.idSesion].participantes[i].username;
                    break;
                }
            io.sockets.emit('pedir_tiempo',data);
        });
        socket.on('start', function (data) {
            io.sockets.emit('start', data);
        });
        socket.on('givetimemod', function (data) {
            /*listaSesiones[data.idSesion].escenarios[listaSesiones[data.idSesion].IdxEscActual].hh = data.hh;
            listaSesiones[data.idSesion].escenarios[listaSesiones[data.idSesion].IdxEscActual].mm = data.mm;
            listaSesiones[data.idSesion].escenarios[listaSesiones[data.idSesion].IdxEscActual].ss = data.ss;*/
            listaSesiones[data.idSesion].escenarios[listaSesiones[data.idSesion].IdxEscActual].flag = 1;
            listaSesiones[data.idSesion].escenarios[listaSesiones[data.idSesion].IdxEscActual].bool = 0;
            io.sockets.emit('givetimemod', data);
        });
        socket.on('resultFinal', function (data) {
            bool_result_final[2] = true;
            io.sockets.emit('resultFinal', data);
        });
        socket.on('resultado', function (data) { //agregar los part que ya mandaron sus decisiones
            listaSesiones[data.idSesion].escenarios[data.indexEsc].revisados.push(listaSesiones[data.idSesion].participantes[data.namePart].username);
            data.namePart = listaSesiones[data.idSesion].participantes[data.namePart].username;
            io.sockets.emit('resultado', data);
        });
        socket.on('ver_result', function (data) {
            io.sockets.emit('ver_result', data);
        });
    });
});

