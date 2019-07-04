const { series, src, dest } = require('gulp');
const uglify = require('gulp-uglify-es').default;
const del = require('del');

const dest_folder = 'dist/';

const minify = () => {
    const options = {
        compress: {
            toplevel: true,
            drop_console: true
        },
        mangle: {
            toplevel: true,
            keep_classnames: false,
            keep_fnames: false
        },
        output: {
            beautify: false
        },
        nameCache: {}
    };
    return src(['*.js', '!gulpfile.js', '!build*.js'])
        .pipe(uglify(options))
        .pipe(dest(dest_folder));
};

const copy_assets = () => {
    return src([
        '*.html',
        'icon.*',
        '*.yml',
        'Dockerfile',
        '.dockerignore',
        'bin'
    ]).pipe(dest(dest_folder));
};

const clean = () => {
    return del([`${dest_folder}**`]);
};

exports.default = series(clean, minify, copy_assets);
