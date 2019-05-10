const gulp = require('gulp')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const replace = require('gulp-replace')
const sass = require('gulp-sass')
const cleanCSS = require('gulp-clean-css')
const prefixer = require('gulp-autoprefixer')
const pack = require('./package.json')

const exportModuleName = 'VXETablePluginElement'

gulp.task('build_style', function () {
  return gulp.src('style.scss')
    .pipe(sass())
    .pipe(prefixer({
      borwsers: ['last 1 version', '> 1%', 'not ie <= 8'],
      cascade: true,
      remove: true
    }))
    .pipe(gulp.dest('dist'))
    .pipe(cleanCSS())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('build_common', function () {
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

gulp.task('build_umd', function () {
  return gulp.src('index.js')
    .pipe(babel({
      moduleId: pack.name,
      presets: ['@babel/env'],
      plugins: [['@babel/transform-modules-umd', {
        globals: {
          [pack.name]: exportModuleName,
          'xe-utils': 'XEUtils'
        },
        exactGlobals: true
      }]]
    }))
    .pipe(replace(`global.${exportModuleName} = mod.exports;`, `global.${exportModuleName} = mod.exports.default;`))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('build', gulp.parallel('build_style', 'build_common', 'build_umd'))
