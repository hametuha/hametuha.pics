var Pageres = require('pageres'),
    fs      = require('fs'),
    configs = require('config'),
    Puid    = require('puid');


/**
 * Get cover url
 * @param {String} id
 * @returns {string}
 */
function coverUrl(id) {
  return configs.get('host') + '/out/' + id + '.jpg';
}

/**
 * Get cover file path
 * @param {String} id
 * @returns {string}
 */
function coverPath(id) {
  return appRoot + '/public/out/' + id + '.jpg';
}

/**
 * Detect if cover exists.
 *
 * @param {String} id
 * @param {Function} errorCallback
 * @param {Function} successCallback
 */
module.exports.exists = function (id, errorCallback, successCallback) {
  var path = coverPath(id);
  fs.access(path, fs.R_OK, function (err) {
    if (err) {
      errorCallback(err);
    } else {
      successCallback(path, coverUrl(id));
    }
  });
};

/**
 * Generate cover image
 *
 * @param {String} id
 * @param {Array} sizes
 * @param {Function} error
 * @param {Function} success
 */
module.exports.generate = function (id, sizes, error, success) {
  // Pageresで取得する
  var endpoint = configs.get('host') + '/covers/preview/' + id + '/?ss=true';

  var pageres = new Pageres({
    delay   : 5,
    format  : 'png',
    filename: id
  })
    .src(endpoint, sizes)
    .dest(appRoot + '/public/out');
  // 取得
  pageres.run(function (err) {
    if (err) {
      error(err);
    } else {
      success(coverPath(id), coverUrl(id));
    }
  });
};

module.exports.capture = function (params, successCallback, errorCallback) {
  // Validate
  if (!params.url) {
    return false;
  }
  var size = params.size || '1200x1920';
  var delay = params.delay || 10;
  var puid = new Puid('JS');
  var filename = puid.generate();
  var endpoint = configs.get('host') + '/screenshots/' + filename + '.jpg';
  // Generate
  var pageres = new Pageres({
    delay   : delay,
    format  : 'png',
    filename: filename,
    crop: true
  })
    .src(params.url, [size], {})
    .dest(appRoot + '/public/screenshots')
    .run()
    .then(function () {
      successCallback(endpoint, filename);
    }).catch(function (err) {
      errorCallback(err, filename);
    });
  return filename;
};

module.exports.url = coverUrl;
