import { string, object } from 'yup';

import signer from '../utils/signer';

const validateMiddleware = [
  (req, res, next) => {
    const schema = object().shape({
      token: object()
        .shape({
          password: string().required(),
          libraryPath: string().required(),
          slotId: string().required(),
          id: string().required()
        })
        .required(),
      hash: string().required()
    });
    schema
      .validate(req.body)
      .then(() => next())
      .catch(err => {
        res.status(422).json({ message: err.message });
      });
  }
];

const signRoute = (req, res) => {
  const { token, hash } = req.body;
  const assinatura = signer.sign(
    token.libraryPath,
    token.slotId,
    token.password,
    Buffer.from(token.id, 'hex'),
    Buffer.from(hash, 'base64')
  );
  const signCertificate = signer.getSignCertificate(
    token.libraryPath,
    token.slotId,
    Buffer.from(token.id, 'hex')
  );
  const otherCertificates = signer.getAllCertificates(
    token.libraryPath,
    token.slotId
  );
  res.json({ assinatura, signCertificate, otherCertificates });
};

export default { apiCall: signRoute, middlewares: validateMiddleware };
