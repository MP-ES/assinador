import listCertificates from '../../utils/listCertificates';

const tokenRoute = async (_, res) => {
  const tokens = await listCertificates();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify(tokens));
  res.end();
};

export default tokenRoute;
