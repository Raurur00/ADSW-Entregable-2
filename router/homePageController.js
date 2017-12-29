module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('index.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });
    app.post('/', function (req, res) {
        res.render('index.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.get('/en', function (req, res) {
        res.render('index_en.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });
    app.post('/en', function (req, res) {
        res.render('index_en.html', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    });

    app.get('/layout', function(res) {
        res.render('layout.html');
    });
};