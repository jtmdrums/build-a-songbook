var gulp = require("gulp"),
    babel = require("gulp-babel"),
    sass = require("gulp-sass")

gulp.task("babel-js", function () {
  return gulp.src("public/javascripts/src/*.js")
    .pipe(babel())
    .on('error', function(err){
      console.log('ERROR --- ', err)
      this.emit('end')
    })
    .pipe(gulp.dest("public/javascripts/compiled"))
})

gulp.task("sass", function(){
  return gulp.src("public/stylesheets/src/style.sass")
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest("public/stylesheets"))
})

gulp.task("watch", function(){
  gulp.watch("public/javascripts/src/*.js", ['babel-js'])
  gulp.watch("public/stylesheets/**/*.sass", ['sass'])
})

gulp.task("default", ["babel-js", "sass", "watch"])