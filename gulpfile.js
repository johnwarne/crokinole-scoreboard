const gulp        = require('gulp');
const sass        = require('gulp-sass')(require('sass'));
const purgecss = require('gulp-purgecss');
const browserSync = require('browser-sync').create();
const concat      = require('gulp-concat');
const uglify      = require('gulp-uglify');

// Sass task to compile style.original.scss to style.css
gulp.task('sass', function() {
  return gulp.src('scoreboard/css/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(purgecss({
      content: ['scoreboard/index.html'],
      safelist: {
        deep: [/modal-message$/],
      },
      variables: true
    }))
    .pipe(gulp.dest('scoreboard/css'))
    .pipe(browserSync.stream());
});

// Concat task to concatenate the JS files
gulp.task('concat', function() {
  return gulp.src([
      'scoreboard/js/vue.min.js',
      'scoreboard/js/confetti.browser.min.js',
      'scoreboard/js/script.js'
    ])
    .pipe(concat('scoreboard/js/script.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./'));
});

// Watch task to automatically compile Sass and reload on changes
gulp.task('watch', function() {
  browserSync.init({
    proxy: 'https://crokinole.test/scoreboard/',
    port: 3000,
    open: false,
  });
  gulp.watch(['**/*.scss'], gulp.series('sass'));
  gulp.watch([
    '**/*.js',
    '!scoreboard/js/script.min.js'
  ], gulp.series('concat'));
  gulp.watch([
    'scoreboard/css/style.css',
    'scoreboard/js/script.min.js',
    'scoreboard/index.html'
  ]).on('change', browserSync.reload);
});

// Default task to run the sass, concat, and watch tasks
gulp.task('default', gulp.series('sass', 'concat', 'watch'));