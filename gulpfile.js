var gulp = require('./gulp')([
    'nunjucks',
    'sass',
    'browserify',
    'server',
    'vendor',
    'docs'
]);

gulp.task('build', ['nunjucks','sass','browserify','server']);
gulp.task('default', ['build']);
