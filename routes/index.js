/*
 * GET home page.
 */

exports.index = function (req, res) {
    req.models.Example.find({}, function (err, docs) {
      res.render('punchpage');
    })
};


