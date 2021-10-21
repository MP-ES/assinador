import config from '../../config';
import libmanager from '../../libManager';

const tokenRoute = async (_, res) => {
  let certificates = [];
  config.libs.forEach(lib => {
    const certs = libmanager.getCertificates(lib);
    certificates = [...certificates, ...certs];
  });
  if (config.devMode) {
    certificates = [
      ...certificates,
      {
        id: 'a0000000',
        displayName: 'Certificado de teste 1',
        valid: true,
        libraryPath: 'test',
        slotId: 0
      },
      {
        id: 'b0000000',
        displayName: 'Certificado de teste 2',
        valid: false,
        libraryPath: 'test',
        slotId: 1
      },
      {
        id: 'c0000000',
        displayName: 'Certificado de teste 3',
        valid: true,
        libraryPath: 'test',
        slotId: 2
      }
    ];
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify(certificates));
  res.end();
};

export default tokenRoute;
