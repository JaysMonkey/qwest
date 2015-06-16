var gulp = require('gulp');
var fs = require('fs');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var rimraf = require('rimraf');
var source = require('vinyl-source-stream');
var _ = require('lodash');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var restEmulator = require('gulp-rest-emulator');

var config = {
  entryFile: './src/app.js',
  outputDir: './dist/',
  outputFile: 'app.js'
};

gulp.task('mockserver', function () {
  // Options not require
  var options = {
    port: 8000,
    root: ['./'],
    rewriteNotFound: false,
    rewriteTemplate: 'index.html'
  };
  return gulp.src('./mocks/**/*.js')
    .pipe(restEmulator(options));
});

// clean the output directory
gulp.task('clean', function(cb){
    rimraf(config.outputDir, cb);
});

var bundler;
function getBundler() {
  if (!bundler) {
    bundler = watchify(browserify(config.entryFile, _.extend({ debug: true }, watchify.args)));
  }
  return bundler;
};

function bundle() {
  return getBundler()
    .transform(babelify)
    .bundle()
    .on('error', function(err) { console.log('Error: ' + err.message); })
    .pipe(source(config.outputFile))
    .pipe(gulp.dest(config.outputDir))
    .pipe(reload({ stream: true }));
}

gulp.task('build-persistent', ['clean'], function() {
  return bundle();
});

gulp.task('build', ['build-persistent'], function() {
  process.exit(0);
});

gulp.task('watch', ['build-persistent'], function() {

  getBundler().on('update', function() {
    gulp.start('build-persistent')
  });

  // Options not require
  var options = {
    port: 8000,
    root: ['./'],
    rewriteNotFound: false,
    rewriteTemplate: 'index.html'
  };

  return gulp.src('./mocks/**/*.js')
    .pipe(restEmulator(options));
});

// WEB SERVER
gulp.task('serve', function () {
  browserSync({
    server: {
      baseDir: './'
    }
  });
});
