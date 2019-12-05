import AutoLauncher from 'auto-launch';
const autoLauncher = new AutoLauncher({
  name: 'Assinador MPES'
});

const start = () => autoLauncher.enable();

export default { start };
