import { spawn } from 'child_process';
import path from 'path';
import get_free_port from 'detect-port';
import wait from 'wait-on';
import { app } from 'electron';

import splash from './splash';
import message from './message';

const webapi_path_name = 'bin';
const binary_file = process.platform == 'linux' ? 'Assinador' : 'Assinador.exe';

const startAspnetCoreApp = async () => {
    return new Promise(async resolve => {
        await get_free_port(19333, (_, port) => {
            const binary_path = path.join(
                __static,
                webapi_path_name,
                binary_file
            );
            const options = { cwd: path.join(__static, webapi_path_name) };
            const args = [`port=${port}`];
            const apiProcess = spawn(binary_path, args, options);
            apiProcess.stdout.on('data', data => {
                console.log(`stdout: ${data.toString()}`);
            });

            var waitOptions = {
                resources: [`tcp:${port}`],
                timeout: 10000
            };

            wait(waitOptions)
                .then(() => {
                    if (splash.getWindow()) splash.getWindow().hide();
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

export default {
    start: startAspnetCoreApp
};
