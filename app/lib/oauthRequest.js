var oauth    = require('oauth'),
    passport = require('passport');

/* global credentials:true */

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
 * Get oauth request
 *
 * @param {String} url
 * @param {String} token
 * @param {String} tokenSecret
 * @param {Function} callback
 * @returns {*}
 */
module.exports.get = function (url, token, tokenSecret, callback) {
    var client = getClient();
    url = credentials.wpRoot + '/wp-json' + url;
    return client.get(url, token, tokenSecret, callback);
};

/**
 * Post oauth request
 *
 * @param {String} url
 * @param {String} token
 * @param {String} tokenSecret
 * @param {String} post_body
 * @param {String} post_content_type
 * @param {Function} callback
 * @returns {*}
 */
module.exports.post = function (url, token, tokenSecret, post_body, post_content_type, callback) {
    var client = getClient();
    url = credentials.wpRoot + '/wp-json' + url;
    return client.post(url, token, tokenSecret, post_body, post_content_type, callback);
};


