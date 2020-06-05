import handlerFactory from './handler';

let handlers = {};

const clear = () => {
  handlers = {};
};

const register = (url, method, action) => {
  handlers[url] = { method, action: handlerFactory.createHandler(action) };
};

const missing = req => {
  return handlerFactory.createHandler((_, res) => {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write('No route registered for ' + req.url);
    res.end();
  });
};

const route = req => {
  const handler = handlers[req.url];
  if (!handler || handler.method !== req.method) return missing(req);
  return handler.action;
};

export default {
  clear,
  register,
  route
};
