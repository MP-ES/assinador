import { dialog } from 'electron';

import icon from './icon';

const type = {
  NONE: 'none',
  INFO: 'info',
  ERROR: 'error',
  QUESTION: 'question',
  WARNING: 'warning'
};

const show = (options, action) => {
  if (action) dialog.showMessageBox(options, action);
  dialog.showMessageBox({ icon: icon.get(), ...options });
};

export default { type, show };
