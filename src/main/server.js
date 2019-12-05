/* global __static */
import fs from 'fs';
import https from 'https';
import path from 'path';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import portfinder from 'portfinder';

import tokens from './routes/tokens';
import sign from './routes/sign';

const privateKey = fs.readFileSync(
  path.join(__static, 'local.pem.key'),
  'utf8'
);
const certificate = fs.readFileSync(path.join(__static, 'local.crt'), 'utf8');

const credentials = { key: privateKey, cert: certificate };

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST'],
  exposedHeaders: ['Content-Type', 'Content-Disposition'],
  optionsSuccessStatus: 200
};

const server = express();
server.use(helmet());
server.use(compression());
server.use(cors(corsOptions));
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.get('/health', (req, res) => {
  res.json({ version: '2.0.0' });
});

const router = express.Router();
router.get('/tokens', tokens);
router.post('/sign', sign.middlewares, sign.apiCall);
server.use('/api', router);

const start = async () => {
  const port = await portfinder.getPortPromise({
    port: 19333,
    stopPort: 19433
  });
  const httpsServer = https.createServer(credentials, server);
  httpsServer.listen(port, () => {
    console.log('%s listening at %s', server.name, port);
  });
};

export default { start };
