import os from 'os';

const options = {
  aix: 'aix',
  mac: 'darwin',
  freebsd: 'freebsd',
  linux: 'linux',
  openbsd: 'openbsd',
  sunos: 'sunos',
  windows: 'win32'
};

const current = os.platform();

export default { current, options };
