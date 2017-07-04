var express       = require('express'),
    session       = require('express-session'),
    cookieParser  =  require('cookie-parser'),
    passport      = require('passport'),
    OAuthStrategy = require('passport-oauth').OAuthStrategy,
    path          = require('path'),
    authCheck     = require('./lib/auth-check'),
    logger        = require('morgan'),
    covers        = require('./routes/covers'),
    camera        = require('./routes/camera'),
    app           = express(),
    favicon = require('serve-favicon'),
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

// Set favicon
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

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
        oauthRequest.get('/wp/v2/users/me', token, tokenSecret, function(err, data, response){
            if( err ){
                console.log('ユーザー情報取得失敗', err);
                return done(null, false);
            }else{
                data = JSON.parse(data);
                data.token = token;
                data.tokenSecret = tokenSecret;
                return done(null, data);
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

// 認証コールバック
app.get('/auth/callback', passport.authenticate('wp', {
    successRedirect: '/covers/',
    failureRedirect: '/auth/failure/',
    failureFlash   : true
}));

// ログイン失敗
app.get('/auth/failure', function (req, res, next) {
    res.render('index', {
        title  : 'ログイン失敗',
        message: 'ログインに失敗しました。再度お試しください。',
        avatar: gravatar.url(configs.get('gravatar'), {s: '400', r: 'x', d: 'retro'}, true)
    });
});

// ログアウト
app.get('/auth/logout', function(req, res, next){
    req.session.destroy();
    res.render('index', {
        title  : 'ホーム',
        message: 'ログアウトしました',
        user: false,
        avatar: gravatar.url(configs.get('gravatar'), {s: '400', r: 'x', d: 'retro'}, true)
    });
});

// Register routers
app.use('/covers', covers);
app.use('/camera', camera);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
console.log('EnV=', app.get('env'), configs.get('id'));


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
