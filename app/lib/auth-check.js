module.exports = function(req, res, next){
    if( req.session.passport && req.session.passport.user ){
        next();
    }else{
        res.redirect('/auth');
    }
};
