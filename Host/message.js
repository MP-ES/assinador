const { dialog } = require('electron');

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

module.exports = { type, show };
