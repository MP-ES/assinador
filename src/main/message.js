import { dialog } from 'electron';

const type = {
  NONE: 'none',
  INFO: 'info',
  ERROR: 'error',
  QUESTION: 'question',
  WARNING: 'warning'
};

const show = (options, action) => {
  if (action) dialog.showMessageBox(options, action);
  dialog.showMessageBox(options);
};

export default { type, show };
