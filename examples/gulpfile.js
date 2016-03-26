'use strict';

var gulp = require('gulp');
var targetHTML = require('../index.js');


gulp.task('dist', function() {
  return gulp.src('./input/*.html')
    .pipe(targetHTML('dist'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['dist']);
