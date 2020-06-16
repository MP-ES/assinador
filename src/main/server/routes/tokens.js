import config from '../../config';
import libmanager from '../../libManager';

const tokenRoute = async (_, res) => {
  let certificates = [];
  config.libs.forEach(lib => {
    const certs = libmanager.getCertificates(lib);
    certificates = [...certificates, ...certs];
  });
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify(certificates));
  res.end();
};

export default tokenRoute;
