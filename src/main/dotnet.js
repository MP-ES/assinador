import { spawn } from 'child_process';
import path from 'path';
import wait from 'wait-on';
import { app } from 'electron';

import splash from './splash';
import message from './message';

const webapi_path_name = 'bin';
const binary_file = process.platform == 'linux' ? 'Assinador' : 'Assinador.exe';

const startAspnetCoreApp = async () => {
    return new Promise(async resolve => {
        const binary_path = path.join(__static, webapi_path_name, binary_file);
        const options = { cwd: path.join(__static, webapi_path_name) };
        const apiProcess = spawn(binary_path, [], options);
        apiProcess.stdout.on('data', data =>
            console.log(`stdout: ${data.toString()}`)
        );
        var waitOptions = {
            resources: [`tcp:19333`],
            timeout: 60000
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
};

export default {
    start: startAspnetCoreApp
};
