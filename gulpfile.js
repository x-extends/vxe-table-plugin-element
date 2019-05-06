var gulp = require('gulp')
var uglify = require('gulp-uglify')
const babel = require('gulp-babel')
var rename = require('gulp-rename')

gulp.task('build.common', function () {
  return gulp.src('index.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(rename({
      basename: 'index',
      extname: '.common.js'
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('build.umd', function () {
  return gulp.src('index.js')
    .pipe(babel({
      presets: ['@babel/env'],
      plugins: [['@babel/transform-modules-umd', {
        globals: {
          'xe-utils': 'XEUtils'
        }
      }]]
    }))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('build', gulp.parallel('build.common', 'build.umd'))
