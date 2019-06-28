const { spawn } = require('child_process');
const path = require('path');
const get_free_port = require('detect-port');
const wait = require('wait-on');
const { app } = require('electron');

const { getWindow: getSplash } = require('./splash');
const { getRoot } = require('./utils');
const message = require('./message');

const webapi_path_name = 'bin';
const binary_file = 'Assinador.exe';

const startAspnetCoreApp = async () => {
    return new Promise(async resolve => {
        await get_free_port(19333, (error, port) => {
            const root_path = getRoot();
            const binary_path = path.join(
                root_path,
                webapi_path_name,
                binary_file
            );
            const options = { cwd: path.join(root_path, webapi_path_name) };
            const args = [`port=${port}`];
            apiProcess = spawn(binary_path, args, options);
            apiProcess.stdout.on('data', data => {
                console.log(`stdout: ${data.toString()}`);
            });

            var waitOptions = {
                resources: [`tcp:${port}`],
                timeout: 10000
            };

            wait(waitOptions)
                .then(() => {
                    if (getSplash()) getSplash().hide();
                    resolve();
                })
                .catch(err => {
                    message.show(
                        message.type.WARNING,
                        'Certificado',
                        'Verifique se o certificado foi instalado corretamente!',
                        () => app.quit()
                    );
                    console.log(err);
                });
        });
    });
};

module.exports = {
    start: startAspnetCoreApp
};
