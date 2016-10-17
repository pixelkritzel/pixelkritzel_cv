/* GLOBAL: console */

require('./handlebars-helpers')();

var webpack = require('webpack-stream'),
    gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    handlebars = require('handlebars'),
    gulpHandlebars = require('gulp-handlebars-html')(handlebars),
    rename = require('gulp-rename'),
    yaml = require('js-yaml'),
    fs   = require('fs');

/* pathConfig*/
var entryPoint = './src/scripts/index.js',
    browserDir = './build',
    sassWatchPath = './src/styles/**/*.scss',
    jsWatchPath = './src/scripts/**/*.js',
    htmlWatchPath = './**/*.html',
    hbsWatchPath = './src/templates/**/*.hbs',
    yamlWatchPath = './src/data/**/*.yaml',
    staticPath = './src/static';
/**/

gulp.task('browser-sync', function () {
    const config = {
        server: {baseDir: browserDir}
    };

    return browserSync(config);
});

gulp.task('hbs', () => {
  let data = Object.create(null);
  let stream;
  try {
      data.de = yaml.safeLoad(fs.readFileSync('./src/data/timo_de.yaml', 'utf8'));
      console.log('SUCCESS: German data loaded');
  } catch (e) {
      console.log('ERROR');
      console.log(e);
  }

  try {
      data.en = yaml.safeLoad(fs.readFileSync('./src/data/timo_en.yaml', 'utf8'));
      console.log('SUCCESS: English data loaded');
  } catch (e) {
      console.log('ERROR');
      console.log(e);
  }

  const options = {
      partialsDirectory : ['./src/templates/html/partials']
  };
  for (let key in data) {
    const languageExtension = key === 'en' ? '_en' : '';
    data[key].languageExtension = languageExtension;
    stream = gulp.src('./src/templates/html/index.hbs')
                 .pipe(gulpHandlebars(data[key], options))
                 .pipe(rename(`index${languageExtension}.html`))
                 .pipe(gulp.dest(browserDir));
  }
  return stream;
});

gulp.task('js', function () {

    return gulp.src(entryPoint)
               .pipe(webpack({
                    watch: true,
                    devtool: 'source-map',
                    module: {
                        loaders: [
                            { test: /\.js$/, loader: 'babel' },
                        ],
                    },
                    output: {
                        filename: 'bundle.js'
                    }
               }))
               .pipe(gulp.dest('./build/scripts'))
               .on('data', e => browserSync.reload());
});

gulp.task('sass', function () {
  return gulp.src(sassWatchPath)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 2 versions']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/styles'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('copyStatic', function() {
    return gulp.src(staticPath + '/**/*')
               .pipe(gulp.dest('./build/static'));
});

gulp.task('watch', function () {
    gulp.watch(jsWatchPath, ['js']);
    gulp.watch(sassWatchPath, ['sass']);
    gulp.watch([yamlWatchPath, hbsWatchPath], ['hbs']);
    gulp.watch(staticPath + '/**/*', ['copyStatic']);
    gulp.watch(htmlWatchPath, function () {
        return gulp.src('')
            .pipe(browserSync.reload({stream: true}));
    });
});

gulp.task('run', ['hbs', 'js', 'sass', 'copyStatic', 'watch', 'browser-sync']);