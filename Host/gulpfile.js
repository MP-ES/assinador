const { series, src, dest } = require('gulp');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');
const del = require('del');
const { exec } = require('child_process');

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
    return src(['*.js', '!gulpfile.js', '!uglify.js', '!build*.js'])
        .pipe(uglify(options))
        .pipe(dest('dist/'));
};

const copy_assets = () => {
    return src(['*.html', 'icon.*', 'bin']).pipe(dest('dist/'));
};

const package = () => {
    return src(['package.prod.json'])
        .pipe(rename('package.json'))
        .pipe(dest('dist/'));
};

const clean = () => {
    return del(['dist/**']);
};

const pack = cb => {
    const options = { cwd: 'dist' };
    exec('npm run pack', options, (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
};

const publish = cb => {
    const options = { cwd: 'dist' };
    exec('npm run publish', options, (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
};

exports.default = series(clean, minify, copy_assets, package, publish);
