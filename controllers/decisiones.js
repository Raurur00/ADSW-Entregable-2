var models  = require('../models');

module.exports = function(req, res, next) {
    try {
        models.Decision.findAll().then(function (decision) {
            res.json(decision);
        });
    } catch (ex) {
        console.error("Internal error:" + ex);
        return next(ex);
    }
}