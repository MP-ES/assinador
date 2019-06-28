const { execFile } = require('child_process');
const minimist = require('minimist');
const path = require('path');

const webapi_path_name = 'bin';

const getOutputPath = () => {
    const args = minimist(process.argv.slice(2));
    if (args.path) return path.join(__dirname, args.path);
    return path.join(__dirname, webapi_path_name);
};

const build = () => {
    const project_path = path.join(
        __dirname
            .split(path.sep)
            .slice(0, -1)
            .join(path.sep),
        'Assinador.csproj'
    );
    const output_path = getOutputPath();
    const args = ['publish', project_path, '-o', output_path, '-r', 'win-x64'];

    build_process = execFile('dotnet', args);
    build_process.stdout.on('data', data => {
        console.log(data.toString());
    });
    build_process.on('error', err => {
        console.log('Failed to start subprocess.');
        console.log({ err });
    });
};

build();
