module.exports = function (app, passport) {
    app.get('/login', function (req, res) {
        res.render('login.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.get('/login_en', function (req, res) {
        res.render('login_en.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.post('/login_en', passport.authenticate('local-login', {
        successRedirect: '/en#portfolio', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/#portfolio', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/loginAdmin', function(req, res) {
        res.render('loginAdmin.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.post('/loginAdmin', passport.authenticate('local-login-admin', {
        successRedirect: '/homeAdmin', // redirect to the secure profilerequire('./historialPageController')(app); section
        failureRedirect: '/loginAdmin', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/loginAdmin_en', function(req, res) {
        res.render('loginAdmin_en.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.post('/loginAdmin_en', function(req, res) {
        res.render('loginAdmin_en.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.get('/registro', function (req, res) {
        res.render('registro.html', {success: req.flash('success'),
            error: req.flash('error')});
    });

    app.post('/registro', passport.authenticate('local-signup', {
        successRedirect: '/en', // redirect to the secure profiles.handlebars section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));


    app.get('/sign_up', function (req, res) {
        res.render('registro_en.html', {success: req.flash('success'),
            error: req.flash('error')});
    });

    app.post('/sign_up', function (req, res) {
        res.render('registro_en.html', {success: req.flash('success'),
            error: req.flash('error')});
    });

    app.get('/logout', function (req, res) {
        //delete logueados[req.user.id];
        req.logout();
        res.redirect('/#portfolio');
    });
    app.get('/logout_en', function (req, res) {
        //delete logueados[req.user.id];
        req.logout();
        res.redirect('/en#portfolio');
    });
};