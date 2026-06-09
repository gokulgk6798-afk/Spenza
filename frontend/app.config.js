const configureApp = require('../app.config');

module.exports = (context) => configureApp({
  ...context,
  projectRoot: __dirname,
});
