var express   = require('express'),
    router    = express.Router(),
    Cover     = require('../models/cover'),
    fs        = require('fs'),
    authCheck = require('../lib/auth-check'),
    path      = require('path'),
    Pageres   = require('pageres'),
    configs   = require('config');

// GET list page
router.get('/', authCheck, function (req, res, next) {
    res.render('covers', {
        title: 'カバー一覧',
        name : req.session.passport.user.name,
        user : req.session.passport.user
    });
});

// Add cover
router.post('/add/', authCheck, function (req, res, next) {
    try {
        var cover = new Cover(req.body);
        cover.save(function (err) {
            if (err) {
                throw new Error(err);
            } else {
                res.json(cover);
            }
        });
    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
});

// Show list
router.get('/list/', authCheck, function (req, res, next) {
    Cover.find({
        user: req.session.passport.user.id
    }, function (err, doc) {
        if (err) {
            res.status(500).json({
                message: err
            })
        } else {
            res.json(doc);
        }
    });
});

router.get('/capture/:id/', authCheck, function (req, res, next) {
    Cover.findOne({
        _id: req.params.id
    }, function (err, cover) {
        if (err || cover.user != req.session.passport.user.id) {
            res.status(500).json({
                title  : 'Not found',
                message: '該当するカバーはありませんでした。'
            })
        }
        // Pageresで取得する
        var endpoint = configs.get('host') + '/covers/preview/' + cover._id + '/?ss=true';

        var pageres = new Pageres({
            delay : 5,
            format: 'jpg',
            filename: cover._id
        })
            .src(endpoint, ['1200x1920'], {})
            .dest(appRoot + '/public/out');
        // 取得
        pageres.run(function (err) {
            if (err) {
                res.json({
                    message: '取得できませんでした',
                });
            } else {
                res.json({
                    url: '/covers/' + req.params.id
                });
            }
        });
    });
});

router.get('/:id/', authCheck, function (req, res, next) {
    var file = './public/out/' + req.params.id + '.jpg',
        fileStream;
    fs.access(file, fs.R_OK, function (err) {
        if (err) {
            res.status(404).render('error', {
                title  : 'Not found',
                message: '該当するカバーはありませんでした。'
            });
        } else {
            res.download(file, 'cover_' + req.params.id + '.jpg', function(err){
                if( err && !res.headersSent ){
                    res.status(500).render('error', {
                        title  : 'Not found',
                        message: '画像のダウンロードに失敗しました。'
                    });
                }
            });
        }
    });
});

router.delete('/:id/', authCheck, function (req, res, next) {
    Cover.findOne({
        _id: req.params.id
    }, function (err, cover) {
        if (err || cover.user != req.session.passport.user.id) {
            res.render('error', {
                title  : 'Not found',
                message: '該当するカバーはありませんでした。'
            });
        } else {
            Cover.remove({
                _id: req.params.id
            }, function (err) {
                res.json({
                    message: 'OK'
                });
            })
        }
    });
});

// Preview
router.get('/preview/:id/', function (req, res, next) {
    var preview = true,
        port    = '';
    if (req.query.ss) {
        preview = false;
        port = 'expand';
    }
    Cover.findOne({_id: req.params.id}, function (err, cover) {
        if (err) {
            res.render('error', {
                title  : 'Not found',
                message: '該当するカバーはありませんでした。'
            });
        } else {
            res.render('cover/' + cover.type, {
                title   : cover.title,
                subTitle: cover.subTitle,
                author  : cover.author,
                type    : cover.type,
                port    : port,
                preview : preview
            });
        }
    });
});

module.exports = router;
