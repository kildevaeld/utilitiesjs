

const gulp = require('gulp'),
  webpack = require('gulp-webpack');


gulp.task('default', () => {

  gulp.src('./client.js')
  .pipe(webpack({
    entry: './client.js',
    output: {
      filename: 'client.js'
    }
  }))
  .pipe(gulp.dest('public'))


});