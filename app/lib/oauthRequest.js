var oauth    = require('oauth'),
    passport = require('passport');

/**
 * Get client
 * @returns {oauth.OAuth}
 */
function getClient() {
    console.log('リクエスト！', credentials);
    return new oauth.OAuth(
        credentials.requestTokenURL,
        credentials.accessTokenURL,
        credentials.key,
        credentials.secret,
        '1.0A',
        null,
        'HMAC-SHA1'
    );
};

/**
 * Validate session
 */
function validateSession() {
    if (!passport.session || !passport.session.token || !passport.session.tokenSecret) {
        throw new Error('something bad happened');
    }
};

/**
 * Get oauth request
 *
 * @param url
 * @param callback
 * @returns {*}
 */
module.exports.get = function (url, callback) {
    var client = getClient();
    validateSession();
    url = credentials.wpRoot + '/wp-json/wp/v2' + url;
    console.log(url);
    return client.get(url, passport.session.token, passport.session.tokenSecret, callback);
};

/**
 * Post oauth request
 *
 * @param url
 * @param callback
 * @returns {*}
 */
module.exports.post = function (url, callback, post_body, post_content_type) {
    var client = getClient();
    validateSession();
    url = credentials.wpRoot + '/wp-json/wp/v2' + url;
    return client.post(url, passport.session.token, passport.session.tokenSecret, post_body, post_content_type, callback);
};


