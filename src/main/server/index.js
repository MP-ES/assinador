import http from 'http';
import { app } from 'electron';

import router from './router';
import tokens from './routes/tokens';
import sign from './routes/sign';

const defaultPort = 19333;

router.register('/health', 'GET', (_, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify({ version: app.getVersion() }));
  res.end();
});
router.register('/api/tokens', 'GET', tokens);
router.register('/api/sign', 'POST', sign);

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
  } else {
    const handler = router.route(req);
    handler.process(req, res);
  }
});

export default {
  start: () => server.listen(process.env.ASSINADOR_MPES_PORTA || defaultPort)
};
