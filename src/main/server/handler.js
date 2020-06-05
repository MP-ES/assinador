const Handler = function (method) {
  this.process = function (req, res) {
    const params = null;
    if (method) return method.apply(this, [req, res, params]);
  };
};

const createHandler = function (method) {
  return new Handler(method);
};

export default { createHandler };
