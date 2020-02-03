import AutoLauncher from 'auto-launch';

const autoLauncher = new AutoLauncher({
  name: 'Assinador MPES'
});

const start = () => {
  if (process.env.NODE_ENV !== 'develpment') autoLauncher.enable();
};

export default { start };
