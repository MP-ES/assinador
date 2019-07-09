const { execFile } = require('child_process');
const minimist = require('minimist');
const path = require('path');

const args = minimist(process.argv.slice(2));

// https://docs.microsoft.com/en-us/dotnet/core/rid-catalog
const getRID = os => {
    const rids = {
        linux: 'linux-x64',
        win32: 'win-x64',
        darwin: 'osx-x64'
    };
    return rids[os];
};

const build = () => {
    const project_path = path.join(__dirname, 'backend', 'Assinador.csproj');
    const dotnet_args = [
        'publish',
        project_path,
        '-o',
        path.join('../', args.p),
        '-r',
        getRID(process.platform)
    ];
    build_process = execFile('dotnet', dotnet_args);
    build_process.stdout.on('data', data => {
        console.log(data.toString());
    });
    build_process.on('error', err => {
        console.log('Failed to start subprocess.');
        console.log({ err });
    });
};

const run = () => {
    const dotnet_args = ['watch', 'run', '--', 'port=19333'];
    build_process = execFile('dotnet', dotnet_args, {
        cwd: path.join(__dirname, 'backend')
    });
    build_process.stdout.on('data', data => {
        console.log(data.toString());
    });
    build_process.on('error', err => {
        console.log('Failed to start subprocess.');
        console.log({ err });
    });
};

const execute = () => {
    if (args.b && args.r) {
        console.log(
            'Não é permitido o uso dos parâmetros "b" e "r" ao mesmo tempo'
        );
        return;
    }
    if (args.b && !args.p) {
        console.log(
            'Informe o parametro "p" com o caminho de destino do compilável'
        );
        return;
    }
    if (args.b) build();
    if (args.r) run();
};

execute();
