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
  const localOptions = { icon: icon.get(), ...options };
  if (action) {
    dialog.showMessageBox(localOptions).then(action);
  } else {
    dialog.showMessageBox(localOptions);
  }
};

export default { type, show };
