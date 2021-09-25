// https://exerror.com/gulp-sass-5-does-not-have-a-default-sass-compiler-please-set-one-yourself-both-the-sass-and-node-sass-packages-are-permitted/
// Helpful links:

const gulp = require('gulp'); 

// https://exerror.com/gulp-sass-5-does-not-have-a-default-sass-compiler-please-set-one-yourself-both-the-sass-and-node-sass-packages-are-permitted/
const sass_compiler = require('sass');
const sass = require('gulp-sass')(sass_compiler);
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const { src } = require('gulp');
const eslint = require("gulp-eslint");
const mocha = require("gulp-mocha");
const sync = require("browser-sync").create();


function copy(cb) {
    gulp.src('routes/*.js')
        .pipe(gulp.dest('copies'));
    cb();
}

// function generateCSS(cb) {
//     gulp.src('./sass/**/*.scss')
//         .pipe(sass().on('error', sass.logError))
//         .pipe(dest('public/stylesheets'));
//     cb();
// }
function generateCSS(cb) {
    gulp.src('./sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('public/stylesheets'))
        .pipe(sync.stream());
    cb();
}

function generateHTML(cb) {
    gulp.src("./views/index.ejs")
        .pipe(ejs({
            title: "Hello Semaphore!",
        }))
        .pipe(rename({
            extname: ".html"
        }))
        .pipe(gulp.dest('public'));
    cb();
}

function runLinter(cb) {
    return gulp.src(['**/*.js', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .on('end', function() {
            cb();
        });
    }

function runTests(cb) {
    return gulp.src(['**/*.test.js'])
        .pipe(mocha())
        .on('error', function() {
            cb(new Error('Test failed'));
        })
        .on('end', function() {
            cb();
        });
}

function watchFiles(cb) {
    gulp.watch('views/**.ejs', generateHTML);
    gulp.watch('sass/**.scss', generateCSS);
    gulp.watch([ '**/*.js', '!node_modules/**'], gulp.parallel(runLinter, runTests));
}

function browserSync(cb) {
    sync.init({
        server: {
            baseDir: "./public"
        }
    });

    gulp.watch('views/**.ejs', generateHTML);
    gulp.watch('sass/**.scss', generateCSS);
    gulp.watch("./public/**.html").on('change', sync.reload);
}


exports.copy = copy;
exports.css = generateCSS;
exports.html = generateHTML;
exports.lint = runLinter;
exports.test = runTests;
exports.watch = watchFiles;
exports.sync = browserSync;
exports.default =  gulp.series(runLinter, gulp.parallel(generateCSS,generateHTML),runTests);