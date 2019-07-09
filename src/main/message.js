import { dialog } from 'electron';

const type = {
    NONE: 'none',
    INFO: 'info',
    ERROR: 'error',
    QUESTION: 'question',
    WARNING: 'warning'
};

const show = (type, title, message, action) => {
    if (action) dialog.showMessageBox({ type, title, message }, action);
    dialog.showMessageBox({ type, title, message });
};

export default { type, show };
