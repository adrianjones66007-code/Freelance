const serverless = require('serverless-http');
const app = require('../../backend/server');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  event.path = event.path.replace(/^\/\.netlify\/functions\/server/, '') || '/';
  if (event.rawUrl) {
    event.rawUrl = event.rawUrl.replace('/.netlify/functions/server', '');
  }
  return handler(event, context);
};
