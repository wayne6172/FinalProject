const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");

gulp.task("build",function(){
    return browserify({
        entries: "./test/GLSL/index.js",
        extensions: [".js"],
        debug: true
    })
    .transform("glslify")
    .transform("babelify",{presets:["@babel/preset-env"]})
    .bundle()
    .pipe(source("mainGLSL.js"))
    .pipe(gulp.dest("test/GLSL"));
});
