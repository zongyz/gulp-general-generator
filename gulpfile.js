var gulp = require('gulp'),
	watcher = require('gulp-watch'),
	sequence = require('gulp-sequence'),
	debug = require('gulp-debug'),
	clean = require('gulp-clean'),
	rename = require('gulp-rename'),
	requirejsOptimize = require('gulp-requirejs-optimize'),
	nunjucks = require('gulp-nunjucks'),
	sass = require('gulp-sass'),
	uglify = require('gulp-uglify'),
	cleanCSS = require('gulp-clean-css'),
	htmlPrettify = require('gulp-html-prettify'),
	pump = require('pump'),
	fs = require('fs'),
	browserSync = require('browser-sync');


var ROOT = './',
	PATH = {
		SRC: ROOT + 'src/',
		DIST: ROOT + 'dist/',
		ASSET: ROOT + 'dist/asset/'
	},
	FOLDER = {
		HTML: 'html/',
		IMG: 'img/',
		CSS: 'css/',
		JS: 'js/',
		VENDOR: 'vendor/'
	},
	SRC = {
		HTML: PATH.SRC + FOLDER.HTML,
		IMG: PATH.SRC + FOLDER.IMG,
		CSS: PATH.SRC + FOLDER.CSS,
		JS: PATH.SRC + FOLDER.JS,
		VENDOR: PATH.SRC + FOLDER.VENDOR
	},
	DIST = {
		HTML: PATH.DIST + FOLDER.HTML,
		IMG: PATH.ASSET + FOLDER.IMG,
		CSS: PATH.ASSET + FOLDER.CSS,
		JS: PATH.ASSET + FOLDER.JS,
		VENDOR: PATH.ASSET + FOLDER.VENDOR
	},
	EXT = {
		HTML: '{html,htm,njk}',
		CSS: '{css,scss,sass}',
		JS: 'js',
		IMG: '{jpg,jpeg,png,gif,bmp}'
	},
	FILE = {
		MOCK: ROOT + 'mock.json',
		REQUIREJS: {
			COMMON: SRC.JS + '_common.js',
			MAIN: SRC.JS + 'main.js'
		}
	};

// primary task ----------------------------------------------------------------------

gulp.task('default', sequence('clean', ['html', 'css', 'js', 'img', 'vendor']));

gulp.task('dev', function(done){
	sequence('default', 'browser', 'watch', done);
});

gulp.task('build', function(done) {
	sequence('default', ['build:js', 'build:css', 'build:html'], 'browser', done);
});


// dev task ----------------------------------------------------------------------

gulp.task('browser', function(){
	return browserSync.init({
		// files: [PATH.DIST + "**"],
		server: {
			baseDir: DIST.HTML,
			directory: true,
			routes: {
				'/asset': PATH.ASSET
			}
		},
		startPath: '/',
		middleware: [
			require("compression")({
				level : 9
			})
		]
	});
});

gulp.task('html', function(done) {
	var mock = fs.existsSync(FILE.MOCK) ? JSON.parse(fs.readFileSync(FILE.MOCK)) : {};
	pump([
		gulp.src(SRC.HTML + '**/!(_)*.' + EXT.HTML),
		nunjucks.compile(mock, {
			tags: {
				// blockStart: '<!--=',
				// blockEnd: '=-->'
			}
		}),
		rename(function(path) {
			path.extname = ".html"
			return path;
		}),
		gulp.dest(DIST.HTML)
	], done);
});

gulp.task('css', function(done) {
	pump([
		gulp.src(SRC.CSS + '**/!(_)*.' + EXT.CSS),
		sass.sync({
			includePaths: [SRC.VENDOR]
		}).on(
			'error', sass.logError
		),
		gulp.dest(DIST.CSS)
	], done);
});

gulp.task('js:common', function(done) {
	pump([
		gulp.src(FILE.REQUIREJS.COMMON),
		requirejsOptimize({
			optimize: 'none', // uglify | none
			baseUrl: SRC.JS,
			wrapShim: true,
			preserveLicenseComments: false, // remove comment
			mainConfigFile: FILE.REQUIREJS.MAIN
		}),
		gulp.dest(DIST.JS)
	], done);
});

gulp.task('js', ['js:common'], function(done) {
	pump([
		gulp.src(SRC.JS + '**/!(_)*.' + EXT.JS),
		gulp.dest(DIST.JS)
	], done);
});

gulp.task('img', function() {
	return gulp.src(SRC.IMG + '**/*.' + EXT.IMG)
		.pipe(gulp.dest(DIST.IMG));
});

gulp.task('vendor', function() {
	return gulp.src(SRC.VENDOR + '**')
		.pipe(gulp.dest(DIST.VENDOR));
});

gulp.task('clean', function() {
	return gulp.src(PATH.DIST, {
			read: false
		})
		.pipe(clean());
});

// watch task ----------------------------------------------------------------------

var watchTask = [],
	watchConfigs = [{
		name: 'html',
		watch: SRC.HTML + '**/*.' + EXT.HTML,
		task: 'html'
	}, {
		name: 'js',
		watch: SRC.JS + '**/*.' + EXT.JS,
		task: 'js'
	}, {
		name: 'css',
		watch: SRC.CSS + '**/*.' + EXT.CSS,
		task: 'css'
	}, {
		name: 'img',
		watch: SRC.IMG + '**/*.' + EXT.IMG,
		task: 'img'
	}, {
		name: 'mock',
		watch: FILE.MOCK,
		task: 'html'
	}];
for (var i = 0; i < watchConfigs.length; i++) {
	(function(config){
		var name = 'watch:' + config.name;
		gulp.task(name, function(done){
			watcher(config.watch, {
				// ignoreInitial:false,
				// read : false
				name: config.name + '-watcher',
				verbose: true
			}, function(){
				sequence([config.task], browserSync.reload);
			}).on('unlink', function(file) {
				console.log('unlink:' + file);
			});
			done();
		});
		watchTask.push(name);
		console.log('- register task [' + name + ']');
	})(watchConfigs[i]);
}
gulp.task('watch', function(done) {
	sequence(watchTask, done);
});


// build task ---------------------------------------------------------------------

gulp.task('build:js', function(){
	return gulp.src(DIST.JS + '/**/*.' + EXT.JS)
		.pipe(uglify())
		.pipe(gulp.dest(DIST.JS));
});

gulp.task('build:css', function(){
	return gulp.src(DIST.CSS + '/**/*.' + EXT.CSS)
		.pipe(cleanCSS({
			compatibility: 'ie8',
			keepSpecialComments : 0
		}))
		.pipe(gulp.dest(DIST.CSS));
});

gulp.task('build:html', function(){
	return gulp.src(DIST.HTML + '/**/*.' + EXT.HTML)
		.pipe(htmlPrettify({
			indent_char: ' ',
			indent_size: 4
		}))
		.pipe(gulp.dest(DIST.HTML));
});


