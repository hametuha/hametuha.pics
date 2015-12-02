var oauth    = require('oauth'),
    passport = require('passport'),
    session  = require('express-session');

/**
 * Get client
 * @returns {oauth.OAuth}
 */
function getClient() {
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
 * @param token
 * @param tokenSecret
 * @param callback
 * @returns {*}
 */
module.exports.get = function (url, token, tokenSecret, callback) {
    var client = getClient();
    url = credentials.wpRoot + '/wp-json/wp/v2' + url;
    return client.get(url, token, tokenSecret, callback);
};

/**
 * Post oauth request
 *
 * @param url
 * @param token
 * @param tokenSecret
 * @param post_body
 * @param post_content_type
 * @param callback
 * @returns {*}
 */
module.exports.post = function (url, token, tokenSecret, post_body, post_content_type, callback) {
    var client = getClient();
    url = credentials.wpRoot + '/wp-json/wp/v2' + url;
    return client.post(url, token, tokenSecret, post_body, post_content_type, callback);
};


