import AutoLauncher from 'auto-launch';
var autoLauncher = new AutoLauncher({
    name: 'Assinador MPES'
});

const start = () => autoLauncher.enable();

export default { start };
