'use strict';

var gulp = require('gulp'),     // gulp core
    watch = require('gulp-watch'),      //watch all change
    plumber = require("gulp-plumber"),      // error reporter
    notify = require("gulp-notify"),       // error reporternotify
    bourbon = require('node-bourbon'),    // bourbon libruary
    prefixer = require('gulp-autoprefixer'),// sets missing browserprefixes
    uglify = require('gulp-uglify'),          // uglifies the js
    sass = require('gulp-sass'),                // sass compiler
    sourcemaps = require('gulp-sourcemaps'),   // help us in debugging code
    rigger = require('gulp-rigger'),            //add samthyng page (//= footer.html)
    cssmin = require('gulp-minify-css'),                // minify the css files
    imagemin = require('gulp-imagemin'),            // img optimisation
    pngquant = require('imagemin-pngquant'),     // optimisation png images
    rimraf = require('rimraf'),                 // for Node (rm -rf )
    browserSync = require("browser-sync"),     // inject code to all devices
    reload = browserSync.reload;               //lockalhost in all devaces

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
        src: {
            html: 'src/*.html',
            js: 'src/js/main.js',
            style: 'src/sass/main.scss',
            img: 'src/img/**/*.*',
            fonts: 'src/fonts/**/*.*'
        },
        watch: {
            html: 'src/**/*.html',
            js: 'src/js/**/*.js',
            style: 'src/sass/**/*.scss',
            img: 'src/img/**/*.*',
            fonts: 'src/fonts/**/*.*'
        },
        clean: './build'
    };

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 3000,
    logPrefix: "Frontend_GM"
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
    gulp.src(path.src.html) 
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) 
        .pipe(rigger()) 
        .pipe(sourcemaps.init()) 
        .pipe(uglify()) 
        .pipe(sourcemaps.write()) 
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    gulp.src(path.src.style) 
        .pipe(plumber({errorHandler: notify.onError({
         title:    'Ошибка :(',
         message:  '<%= error.message %>'
            })}))
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['src/sass/'],
            outputStyle: 'compressed',
            sourceMap: true,
            errLogToConsole: true
        }))
        
        .pipe(sass({includePaths: require('node-bourbon').includePaths}))
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) 
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});


gulp.task('default', ['build', 'webserver', 'watch']);