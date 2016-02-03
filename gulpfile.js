var gulp          = require("gulp"),
    autoprefixer  = require("gulp-autoprefixer"),
    rename        = require("gulp-rename"),
    notify        = require("gulp-notify"),
    concat        = require("gulp-concat"),
    livereload    = require("gulp-livereload"),
    uglify        = require("gulp-uglify"),
    beautify      = require('gulp-beautify'),
    minifyHTML    = require('gulp-minify-html'),
    imagemin      = require('gulp-imagemin'),
    cache         = require('gulp-cache'),
    jshint        = require('gulp-jshint'),
    gulpUtil	  = require('gulp-util'),
    ngAnnotate    = require('gulp-ng-annotate');

gulp.task('images', function() {
	return gulp.src('./src/css/assets/**/*')
	.pipe(cache(imagemin({optimizationLevel: 5, progressive: true, interlaced: true})))
	.pipe(gulp.dest('./dist/css/assets'));
});

gulp.task("css", function(){
	return gulp.src("./src/css/*.css")
	.pipe(gulp.dest("./dist/css"));
});

gulp.task('lint', function() {
	return gulp.src(['./src/javascript/**/*.js'])
	.pipe(jshint())
	.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', function() {
	return gulp.src("./src/javascript/**/*.js")
	.pipe(concat('jsBundle.js'))
	.pipe(beautify({indentSize: 4, indentChar : ' '}))
	.pipe(gulp.dest("./dist/js/"))
	.pipe(rename({suffix: ".min"}))
	.pipe(ngAnnotate())
	.pipe(uglify().on('error', gulpUtil.log)) 
	.pipe(gulp.dest('./dist/js/'))
	.pipe(notify({message:"Minified JS, And Bundled."}));
});

gulp.task('minify-html', function() {
	var opts = {
		conditionals: true
	};
	return gulp.src("./src/templates/**/*.html")
	.pipe(minifyHTML(opts))
	.pipe(gulp.dest('./dist/templates'))
	.pipe(notify({message: "Minified HTML files."}));
});

gulp.task('watch', function(){
	livereload.listen({ start: true});
	gulp.watch(['./views/**/*.html', './dist/**/*.js']).on('change', livereload.changed);
	gulp.watch('./src/templates/**/*.html', ['minify-html']);
	gulp.watch('./src/javascript/**/*.js', ['scripts']);
});

gulp.task('default', ['scripts', 'minify-html', 'images'])