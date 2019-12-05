import listCertificates from '../utils/listCertificates';

const tokenRoute = async (req, res) => {
  const tokens = await listCertificates();
  res.json(tokens);
};
export default tokenRoute;
