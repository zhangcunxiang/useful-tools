const buildServer = require('../server/index');

let app;

module.exports = async (req, res) => {
  if (!app) {
    app = buildServer();
    await app.ready();
  }
  app.server.emit('request', req, res);
};
