import { string, object } from 'yup';

import signer from '../../libManager/signer';

const validateMiddleware = (req, res, next) => {
  const schema = object().shape({
    token: object()
      .shape({
        password: string().required(),
        libraryPath: string().required(),
        slotId: string().required(),
        id: string().required()
      })
      .required(),
    hash: string().required(),
    algoritmoHash: string().required(),
    esquemaAssinatura: string().required()
  });
  schema
    .validate(req.body)
    .then(() => next())
    .catch(err => {
      res.writeHead(422, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify({ message: err.message }));
      res.end();
    });
};

const signRoute = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    req.body = JSON.parse(body);
    validateMiddleware(req, res, () => {
      const { token, hash } = req.body;
      let result;
      if (token.libraryPath === 'test') {
        if (token.throwError) {
          result = {
            signature: '',
            signCertificate: '',
            otherCertificates: []
          };
        } else {
          result = {
            signature: 'test',
            signCertificate: 'test',
            otherCertificates: ['test']
          };
        }
      } else {
        result = signer(
          token.libraryPath,
          token.slotId,
          token.password,
          Buffer.from(token.id, 'hex'),
          Buffer.from(hash, 'base64')
        );
      }
      const { signature, signCertificate, otherCertificates } = result;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(
        JSON.stringify({
          assinatura: signature,
          signCertificate,
          otherCertificates
        })
      );
      res.end();
    });
  });
};

export default signRoute;
