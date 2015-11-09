var express       = require('express'),
    session       = require('express-session'),
    cookieParser  =  require('cookie-parser'),
    passport      = require('passport'),
    OAuthStrategy = require('passport-oauth').OAuthStrategy,
    path          = require('path'),
    authCheck     = require('./lib/auth-check'),
    logger        = require('morgan'),
    covers       = require('./routes/covers'),
    app           = express(),
    gravatar      = require('gravatar'),
    jade          = require('jade'),
    bodyParser    = require('body-parser'),
    configs       = require('config'),
    mongoose      = require('mongoose'),
    oauthRequest  = require('./lib/oauthRequest'),
    MongoStore = require('connect-mongo')(session);

// Set global
global.appRoot = require('app-root-path');
app.set('configs', configs);

// Set views
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Set static path
app.use(express.static(path.join(__dirname, 'public'), {
    lastModified: true
}));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Cookie parser
app.use(cookieParser());
// Set DB
mongoose.connect('mongodb://localhost/hametop');
// Error handling for mongoDB
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function() {
    console.log("Connected to 'MongoDB!");
});


// Enable session
app.use(session(
    {
        secret           : configs.get('consumerKey'),
        resave           : false,
        saveUninitialized: false,
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            clear_interval: 60 * 60 // expireしている物を消す周期
        }),
        cookie: {
            maxAge: 60 * 60 * 1000,
            secure: false
        }
    }
));

//
// Set passport
//
credentials = {
    wpRoot: configs.get('domain'),
    key   : configs.get('consumerKey'),
    secret: configs.get('consumerSecret')
};
credentials.requestTokenURL = credentials.wpRoot + '/oauth1/request';
credentials.accessTokenURL = credentials.wpRoot + '/oauth1/access';
credentials.userAuthorizationURL = credentials.wpRoot + '/oauth1/authorize';
// Set session
app.use(passport.initialize());
app.use(passport.session());
// User serializer
passport.serializeUser(function (user, done) {
    done(null, user);
});
// User deserializer
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});
console.log(credentials);
// Redirect to WordPress
passport.use('wp', new OAuthStrategy({
        requestTokenURL     : credentials.requestTokenURL,
        accessTokenURL      : credentials.accessTokenURL,
        userAuthorizationURL: credentials.userAuthorizationURL,
        consumerKey         : credentials.key,
        consumerSecret      : credentials.secret,
        callbackURL         : configs.get('host') + '/auth/callback'
    },
    function (token, tokenSecret, profile, done) {
        passport.session.token = token;
        passport.session.tokenSecret = tokenSecret;
        oauthRequest.get('/users/me', function(err, data, response){
            if( err ){
                console.log(err);
                return done(null, false);
            }else{
                return done(null, JSON.parse(data));
            }
        });
    }
));

// Top Page
app.get('/', function (req, res, next) {
    var user = false;
    if( req.session.passport && req.session.passport.user ){
        user = req.session.passport.user;
    }
    res.render('index', {
        title  : 'ホーム',
        message: '',
        user: user,
        avatar: gravatar.url(configs.get('gravatar'), {s: '400', r: 'x', d: 'retro'}, true)

    });
});


app.get('/tutorial/', function(req, res, next){
    var user = false;
    if( req.session.passport && req.session.passport.user ){
        user = req.session.passport.user;
    }
    res.render('tutorial', {
        title  : '使い方',
        message: '',
        user: user
    });
});

// 認証
app.get('/auth', passport.authenticate('wp'));
app.get('/auth/callback', passport.authenticate('wp', {
    successRedirect: '/covers/',
    failureRedirect: '/auth/failure/',
    failureFlash   : true
}));
app.get('/auth/failure', function (req, res, next) {
    res.render('index', {
        title  : 'ログイン失敗',
        message: 'ログインに失敗しました。再度お試しください。',
        avatar: gravatar.url(configs.get('gravatar'), {s: '400', r: 'x', d: 'retro'}, true)
    });
});
app.get('/auth/logout', function(req, res, next){
    req.session.destroy();
    res.render('index', {
        title  : 'ホーム',
        message: 'ログアウトしました',
        user: false,
        avatar: gravatar.url(configs.get('gravatar'), {s: '400', r: 'x', d: 'retro'}, true)
    });
});

// URL Enter
app.use('/covers', covers);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            title  : 'エラー ' + err.status + ' | ',
            message: err.message,
            error  : err
        });
    });
}

// production error handler
// no stack-traces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        title  : 'エラー ' + (err.status || 500) + ' | ',
        message: err.message,
        error  : false
    });
});


module.exports = app;

// var server = app.listen(3000, '127.0.0.1', function () {

//   var host = server.address().address
//   var port = server.address().port

//   console.log('Example app listening at http://%s:%s', host, port)

// })

// var express = require('express');
// var path = require('path');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');

// var routes = require('./routes/index');
// var users = require('./routes/users');

// var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// // uncomment after placing your favicon in /public
// //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
// app.use('/users', users);


// module.exports = app;
