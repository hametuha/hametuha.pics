var express = require('express'),
    router  = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('user', {
        title: 'ログイン完了しました',
        name : req.session.passport.user.name,
        user: req.session.passport.user
    });
});

module.exports = router;
