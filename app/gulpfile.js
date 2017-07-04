var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    pngquant    = require('imagemin-pngquant'),
    eventStream = require('event-stream');


// Sassのタスク
gulp.task('sass',function(){
    return gulp.src(['src/sass/**/*.scss'])
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            errLogToConsole: true,
            outputStyle: 'compressed',
            omitSourceMapUrl: false,
            sourceMap: true,
            includePaths: [
                './src/sass',
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
    return gulp.src(['src/js/**/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.concat('app.js'))
        .pipe($.uglify())
        .pipe(gulp.dest('public/js'));
});


// Image min
gulp.task('imagemin', function () {
  return gulp.src('./src/images/**/*')
    .pipe($.imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use        : [pngquant()]
    }))
    .pipe(gulp.dest('./public/images'));
});

// Copy material design con
gulp.task('copyLib', function () {
  return eventStream.merge(
    gulp.src(['./bower_components/mdi/fonts/**/*'])
      .pipe(gulp.dest('./public/fonts/')),
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
      .pipe(gulp.dest('./public/js'))
  );
});

// watch
gulp.task('watch',function(){
    gulp.watch('src/sass/**/*.scss',['sass']);
    gulp.watch('src/js/src/**/*.js', ['jshint']);
  gulp.watch('src/images/src/**/*', ['imagemin']);
});

// Default Tasks
gulp.task('default', [ 'build', 'watch' ]);
gulp.task('build', ['copyLib', 'sass', 'jshint', 'imagemin']);
