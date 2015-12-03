var express      = require('express'),
    router       = express.Router(),
    Cover        = require('../models/cover'),
    authCheck    = require('../lib/auth-check'),
    coverFile    = require('../lib/coverFile'),
    oauthRequest = require('../lib/oauthRequest'),
    configs      = require('config');

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

// Get posts list
router.get('/posts/', authCheck, function (req, res, next) {
    var url = '/hametuha/v1/covers/me/',
        posts = [];
    oauthRequest.get(url, req.session.passport.user.token, req.session.passport.user.tokenSecret, function(err, data, response){
        res.json(data);
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
        coverFile.generate(cover._id, ['1200x1920'], function (err) {
            res.json({
                message: 'エラー: ' + err
            });
        }, function (coverPath, coverUrl) {
            res.json({
                url: '/covers/' + req.params.id
            });
        });
    });
});

router.get('/:id/', authCheck, function (req, res, next) {
    coverFile.exists(req.params.id, function (err) {
        res.status(404).render('error', {
            title  : 'Not found',
            message: '該当するカバーはありませんでした。'
        });
    }, function (coverPath, coverUrl) {
        res.download(coverPath, 'cover_' + req.params.id + '.jpg', function (err) {
            if (err && !res.headersSent) {
                res.status(500).render('error', {
                    title  : 'Not found',
                    message: '画像のダウンロードに失敗しました。'
                });
            }
        });

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

// Generate image
router.post('/generate/:id/', authCheck, function (req, res, next) {

    Cover.findOne({
        _id: req.params.id
    }, function (err, cover) {
        if (err || cover.user != req.session.passport.user.id) {
            res.status(500).json({
                title  : 'Not found',
                message: '該当するカバーはありませんでした。'
            })
        }
        coverFile.generate(cover._id, ['1200x1920'], function (err) {
            res.json({
                message: 'エラー: ' + err
            });
        }, function (coverPath, coverUrl) {
            res.json({
                url: coverUrl
            });
        });
    });

});


// Show post list
router.get('/assign/:id/', authCheck, function (req, res, next) {
    Cover.findOne({
        _id: req.params.id
    }, function (err, doc) {
        if (err || doc.user != req.session.passport.user.id) {
            res.render('error', {
                title  : 'Not Found',
                message: '該当するカバーはありませんでした'
            });
        } else {
            var params = {
                title: 'カバーを設定',
                id   : req.params.id,
                user : req.session.passport.user,
                cover: doc,
                src  : false
            };
            coverFile.exists(req.params.id, function () {
                res.render('assign', params);
            }, function (coverPath, coverUrl) {
                params.src = coverUrl;
                res.render('assign', params);
            });
        }
    });
});


// Assign image
router.post('/assign/:id/to/:post/', authCheck, function(req, res, next){
    var user = req.session.passport.user;
    Cover.findOne({
        _id: req.params.id
    }, function(err, doc){
        if( err || doc.user != user.id ){
            res.status(403).json({
                title: 'Permission Denied',
                message: '該当するカバーはありませんでした'
            });
        } else {
            coverFile.exists(doc._id, function(err){
                res.status(404).json({
                    title: 'Not Found',
                    message: 'まだカバー画像が生成されていません。'
                });
            }, function(path, url){
                oauthRequest.post('/hametuha/v1/cover/' + req.params.post + '/', user.token, user.tokenSecret, {
                    url: url,
                    title: doc.title
                }, '', function(err, data){
                    console.log('Error: ', err, 'Data:', data);
                    if( err ){
                        res.status(500).json(data);
                    }else{
                        res.json(data);
                    }
                });
            });
        }
    });
});

module.exports = router;
