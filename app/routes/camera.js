var express      = require('express'),
    router       = express.Router(),
    Cover        = require('../models/cover'),
    authCheck    = require('../lib/auth-check'),
    coverFile    = require('../lib/coverFile'),
    oauthRequest = require('../lib/oauthRequest'),
    configs      = require('config'),
    request      = require('request');


// Get request and save file
router.post('/ss', function(req, res, next){
  if ( ! req.body.post_back || ! req.body.post_back.match(/^https?:\/\/(hametuha\.com|hametuha\.info|localhost)/)) {
    // Post back is not set.
    return res.status(400).json({
      success: false,
      message: 'post_backにポストバックURLが指定されていません。'
    });
  }
  var result = coverFile.capture({
    url: req.body.url,
    size: req.body.size,
    postBack: req.body.post_back
  }, function(url, id){
    // O.K. Let's send post request.
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    request.post( req.body.post_back, {
      form:{
        success: true,
        url:url,
        id: id
      }
    }, function(err){
      !err || console.log(err);
    });
  }, function(err,  id){
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    request.post(req.body.post_back, {
      form:{
        success:false,
        msg: err,
        id: id
      }
    }, function(err){
      !err || console.log(err);
    });
  });
  if (result) {
    return res.json({
      success: true,
      id: result
    });
  }else{
    return res.status(500).json({
      success: false,
      id: result
    });
  }
} );

router.post('/pb', function(req, res, next){
  console.log(req.body);
  res.json({
    msg: 'Request Done.'
  });
});


module.exports = router;