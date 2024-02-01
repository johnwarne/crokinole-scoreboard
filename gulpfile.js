const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();

// Sass task to compile style.original.scss to style.css
gulp.task('sass', function() {
  return gulp.src('scoreboard/css/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('scoreboard/css'))
    .pipe(browserSync.stream());
});

// Watch task to automatically compile Sass and reload on changes
gulp.task('watch', function() {
  browserSync.init({
    proxy: 'https://crokinole.test/scoreboard/',
    port: 3000,
    open: false,
  });
  gulp.watch('**/*.scss', gulp.series('sass'));
  gulp.watch('**/*.css').on('change', browserSync.reload);
  gulp.watch('*.php').on('change', browserSync.reload);
  gulp.watch('*.html').on('change', browserSync.reload);
  gulp.watch('**/*.js').on('change', browserSync.reload);
});

// Default task to run the watch task
gulp.task('default', gulp.series('sass', 'watch'));
