/**

 The BSD 3-Clause License

 Copyright (c) 2016, Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-isa

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation and/or
 other materials provided with the distribution.

 3. Neither the name of the copyright holder nor the names of its contributors may be
 used to endorse or promote products derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)

 **/

'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var jsdoc = require('gulp-jsdoc3');

gulp.task('default', function () {
    // place code for your default task here
});

gulp.task('docs', ['doc', 'docIcons', 'docExamples', 'docImages']);
gulp.task('build', ['websites', 'nodejs']);
gulp.task('publish', ['build', 'icons', 'vendor', 'helpers', 'docs']);

gulp.task('icons', function () {
    return gulp.src('src/icons/**/*').pipe(gulp.dest('isa/icons'));
});

gulp.task('docIcons', function () {
    return gulp.src('src/icons/**/*').pipe(gulp.dest('docs/gen/icons'));
});

gulp.task('docExamples', function () {
    return gulp.src('examples/**/*').pipe(gulp.dest('docs/gen/examples'));
});

gulp.task('docImages', function () {
    return gulp.src('images/**/*').pipe(gulp.dest('docs/gen/images'));
});

gulp.task('vendor', function () {
    return gulp.src('src/public/**/*').pipe(gulp.dest('isa/public'));
});

gulp.task('helpers', function () {
    return gulp.src('src/helpers/**/*').pipe(gulp.dest('isa/helpers'));
});

gulp.task('websites', function () {
    return gulp.src(['src/*Mapper.html', 'src/*Server.html', 'src/isa*.html', 'src/*Id.html'])
        .pipe(htmlmin({
            minifyJS: true, minifyCSS: true, minifyURLs: true,
            maxLineLength: 120, preserveLineBreaks: false,
            collapseWhitespace: true, collapseInlineTagWhitespace: true, conservativeCollapse: true,
            processScripts: ["text/x-red"], quoteCharacter: "'"
        }))
        .pipe(gulp.dest('isa'))
});

gulp.task('nodejs', function () {
    return gulp.src(['src/*Mapper.js', 'src/*Server.js', 'src/isa*', 'src/*Id.js'])
        .pipe(gulp.dest('isa'));
});

gulp.task('doc', function (cb) {
    gulp.src(['README.md', 'src/*Mapper.js', 'src/*Server.js',
        'src/isa*.js', 'src/*Id.js'], {read: false})
        .pipe(jsdoc(cb));
});
