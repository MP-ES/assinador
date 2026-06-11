import { app } from 'electron';
import AutoLauncher from 'auto-launch';
const autoLauncher = new AutoLauncher({
  name: 'Assinador MPES'
});

const start = () => {
  if (app.isPackaged) autoLauncher.enable();
};

export default { start };
