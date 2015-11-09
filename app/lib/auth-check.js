module.exports = function(req, res, next){
    console.log(req.session.passport);
    if( req.session.passport && req.session.passport.user ){
        next();
    }else{
        res.redirect('/auth');
    }
};
