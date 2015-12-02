// ライブラリの読み込み
var express       = require('express'), // Webフレームワーク
    session       = require('express-session'), // Express用セッションモジュール
    cookieParser  = require('cookie-parser'), // Cookieを取得できるモジュール
    passport      = require('passport'), // ログイン用モジュール
    OAuthStrategy = require('passport-oauth').OAuthStrategy, // PassportのOAuth用モジュール
    path          = require('path'), // パス読み込みモジュール
    jade          = require('jade'), // テンプレートエンジン
    bodyParser    = require('body-parser'), // POSTのbodyを取得
    configs       = require('config'), // 設定をJSONから読み込む
    mongoose      = require('mongoose'), // Mongooseドライバ
    MongoStore    = require('connect-mongo')(session), // セッションをMongoDBに保存
    // 以下、オリジナルの処理
    app           = express(), // Expressを初期化
    oauthRequest  = require('./lib/oauthRequest'), // OAuthリクエスト
    authCheck     = require('./lib/auth-check'); // ログインチェック

//
// 初期設定
// ==================================
//
// 設定ファイルを読み込み
// configs.getでJSONの中身を取得する
app.set('configs', configs);
// テンプレートのフォルダを指定
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
// 静的ファイルの読み込みを指定
app.use(express.static(path.join(__dirname, 'public'), {
    lastModified: true
}));
// POSTを受け取れるように
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Cookieを解析できるように
app.use(cookieParser());


//
// MongoDBへの接続
// ==================================
//
mongoose.connect('mongodb://localhost/hametop');
// 接続エラーならメッセージ表示
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
// 接続に成功したらログを表示
mongoose.connection.once('open', function () {
    console.log("Connected to 'MongoDB!");
});

//
// セッションの設定
// ==================================
//
app.use(session(
    {
        secret           : 'joisejw839982u', //
        resave: false,
        saveUninitialized: false,
        store            : new MongoStore({
            mongooseConnection: mongoose.connection,
            clear_interval    : 60 * 60 // expireしている物を消す周期
        }),
        cookie           : {
            maxAge: 60 * 60 * 1000,
            secure: false
        }
    }
));


//
// ログインライブラリの設定
// ==================================
//
credentials = {
    wpRoot: configs.get('domain'),
    key   : configs.get('consumerKey'),
    secret: configs.get('consumerSecret')
};
// 認証情報を設定
credentials.requestTokenURL = credentials.wpRoot + '/oauth1/request';
credentials.accessTokenURL = credentials.wpRoot + '/oauth1/access';
credentials.userAuthorizationURL = credentials.wpRoot + '/oauth1/authorize';
// セッションを開始
app.use(passport.initialize());
app.use(passport.session());



// トップページの描画
app.get('/', function (req, res, next) {
    var user = false;
    res.render('index', {
        title  : 'ホーム',
        message: '',
        user   : user
    });
});










//
// WordPressへのリダイレクト処理
// ===================================
//
// Passportはシリアライザーを指定しないと動かないっぽい
// 若干おまじない気味
// User serializer
passport.serializeUser(function (user, done) {
    done(null, user);
});
// User deserializer
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

// 認証処理をwpという名前で設定
passport.use('wp', new OAuthStrategy({
        requestTokenURL     : credentials.requestTokenURL,
        accessTokenURL : credentials.accessTokenURL,
        userAuthorizationURL: credentials.userAuthorizationURL,
        consumerKey         : credentials.key,
        consumerSecret      : credentials.secret,
        callbackURL         : configs.get('host') + '/auth/callback'
    },
    function (token, tokenSecret, profile, done) {
        // WordPressのエンドポイントを叩いて情報を取得
        oauthRequest.get('/users/me', token, tokenSecret, function (err, data, response) {
            // 成功したら、dataにはユーザー情報が入っている
            console.log(data);
            if (err) {
                console.log(err);
                return done(null, false);
            } else {
                data = JSON.parse(data);
                data.token = token;
                data.tokenSecret = tokenSecret;
                return done(null, data);
            }
        });
    }
));


// /authで認証処理を開始（WordPressへリダイレクト）
app.get('/auth', passport.authenticate('wp'));

// 認証成功したら/auth/callbackに戻ってくるので、
// うえで作成した認証処理を実行
app.get('/auth/callback', passport.authenticate('wp', {
    successRedirect: '/hello/',
    failureRedirect: '/auth/failure/',
    failureFlash   : true
}));

// 認証失敗のコールバック
app.get('/auth/failure', function (req, res, next) {
    res.render('error', {
        title  : 'ログイン失敗',
        message: 'ログインに失敗しました。再度お試しください。'
    });
});

// 認証成功したらこんにちはページを出力
app.get('/hello', authCheck, function(req, res, next){
    res.render('hello', {
        title: 'こんにちは',
        user: req.session.passport.user
    })
});

// 投稿の一覧を取得する
app.get('/posts', authCheck, function(req, res, next){
    res.render('posts', {
        title: 'あなたの投稿',
        user: req.session.passport.user
    })
});

// WordPressに問い合わせる
app.get('/posts/list', authCheck, function(req, res, next){
    var token = req.session.passport.user.token,
        tokenSecret = req.session.passport.user.tokenSecret;
    oauthRequest.get('/posts', token, tokenSecret, function(err, data, response){
        console.log('コールバック！', data );
        res.json(JSON.parse(data));
    })
});

// ログアウト
app.get('/auth/logout', authCheck, function (req, res, next) {
    req.session.destroy();
    res.render('index', {
        title  : 'ホーム',
        message: 'ログアウトしました',
        user   : false
    });
});

// 404エラー
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// エラーハンドラー
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        title  : 'エラー ' + err.status + ' | ',
        message: err.message,
        error  : err
    });
});


module.exports = app;
