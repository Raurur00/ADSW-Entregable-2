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
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var nodemailer = require("nodemailer");
var crypto = require('crypto');
var listaSesiones={};
var timer2 = {
    hr: 0,
    min: 1,
    seg: 0,
    cont: 0
}

// Init App
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

//Express
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));


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
require('./router/routes.js')(app, passport, nodemailer, crypto, timer2,listaSesiones); // load our routes and pass in our app and fully configured passport
require('./config/passport')(passport); // pass passport for configuration
app.use('/api', require('./router/api'));

//Start Server
models.sequelize.sync().then(function () {
	var server = app.listen(3000, function () {
		var host = ip.address();
		var port = server.address().port;
		console.log('Example app listening at http://%s:%s', host, port);
	});
    var io = require('socket.io')(server);

    io.on('connection', function (socket) {
        console.log('Alguien se ha conectado con Sockets',socket.id);
        socket.on('chat', function (data) {
            io.sockets.emit('chat', data);
        });
        socket.on('iniciar', function (data) {
            require('./controllers/timer')(data.hora,data.minuto,data.segundo,io, timer2);
        });
        socket.on('start', function (data) {
            io.sockets.emit('start', data);
        });
        socket.on('conectado', function(data) {
            var idSesion = data.idSesion;
            listaSesiones[idSesion].conectados.push(data.username);
        });
    });
});

