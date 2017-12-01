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
var jsontoxml = require('jsontoxml');
var lista_sockets = {};
var resultados = {};
var listaSesiones={};
var listaDecisiones=null;
var logueados = {};
var resultado_por_escenario = {};
var resultado_final = [];
var bool_result_final = [-1,false, false, true]; /*[0] index del grafico por escenario
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
require('./router/routes.js')(app, passport, nodemailer, crypto, listaSesiones,listaDecisiones,
    logueados, resultado_por_escenario, bool_result_final, resultado_final, resultados,jsontoxml);
require('./config/passport')(passport, logueados); // pass passport for configuration
app.use('/api', require('./router/api'));

app.locals = {
    olakease: "olakease",
    logueados: logueados,
    listaSesiones: listaSesiones,
    listaDecisiones: listaDecisiones
}

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

        console.log('Alguien se ha conectado con Sockets',socket.id, socket.username);

        socket.on('votos', function(data) {
            io.sockets.emit('votos', data);
            console.log("ENVIANDOOOOOOOOOO VOTOS: ", data.votos);
        });

        socket.on('grafico', function (data) {
            io.sockets.emit('grafico', data);
        });

        socket.on('estadisticas', function (data) {
            io.sockets.emit('estadisticas', data);
        });

        socket.on('online', function (data) {
            console.log("ESTOY ENVIANDO EL PUTO SOCKET", data.username);
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
        socket.on('start', function (data) {
            io.sockets.emit('start', data);
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
        socket.on('conectado', function(data) {
            socket.username = data.username;
            var idSesion = data.idSesion;
        });
    });
});

