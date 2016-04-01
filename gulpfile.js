var gulp = require('gulp');
var gls = require('gulp-live-server');
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');

gulp.task('less', function(){
	return gulp.src(["public/less/main.less", "public/less/admin.less"])
		.pipe(less())
		.pipe(cleanCSS({
			processImport: false
		}))
		.pipe(gulp.dest("public/stylesheets/"));
});

gulp.task('serve', ['less'], function(){
	var server = gls.new(["--debug", "wikinote.js"]);

	server.start();

	gulp.watch(['wikinote.js', 'routes/**/*.js', 'test/**/*.js', 'app/**/*.js', 'config/**/*.js', 'views/**/*.html'], function(){
		server.start.bind(server)();
	});

	gulp.watch(["public/less/**/*.less"], ["less"]);
});

gulp.task('default', ['serve']);
