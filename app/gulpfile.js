var gulp = require('gulp'),
    $ = require('gulp-load-plugins')();


// Sassのタスク
gulp.task('sass',function(){
    return gulp.src(['public/sass/**/*.scss'])
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            errLogToConsole: true,
            outputStyle: 'compressed',
            omitSourceMapUrl: false,
            sourceMap: true,
            includePaths: [
                './public/sass',
                './bower_components/bourbon/app/assets/stylesheets',
                './bower_components/neat/app/assets/stylesheets',
                './bower_components/mdi/scss',
                './bower_components/lumx/core/scss'
            ]
        }))
        .pipe($.autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('public/css'));
});

// JSHint and minify
gulp.task('jshint', function() {
    return gulp.src(['public/js/src/**/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.sourcemaps.init({
            loadMaps: true
        }))
        .pipe($.concat('app.js'))
        .pipe($.uglify())
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest('public/js/dist'));
});

// Copy material design con
gulp.task('copyLib', function(){
    gulp.src(['./bower_components/mdi/fonts/**/*'])
        .pipe(gulp.dest('./public/fonts/'));
    gulp.src([
        'bower_components/jquery/dist/jquery.js',
        'bower_components/velocity/velocity.js',
        'bower_components/moment/min/moment-with-locales.js',
        'bower_components/angular/angular.js',
        'bower_components/lumx/dist/lumx.js'
    ])
        .pipe($.sourcemaps.init({
            loadMaps: true
        }))
        .pipe($.concat('lib.js'))
        //.pipe($.uglify())
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest('./public/js/dist'));
});

// watch
gulp.task('watch',function(){
    gulp.watch('public/sass/**/*.scss',function(event){
        gulp.run('sass');
    });
    gulp.watch('public/js/src/**/*.js',function(event){
        gulp.run('jshint');
    });
});

// Default Tasks
gulp.task('default', function() {
    gulp.run('watch');
});

gulp.task('build', function(){
    gulp.run(['copyLib', 'sass', 'jshint'])
});