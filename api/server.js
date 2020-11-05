const Koa = require('koa');
const CORS = require('@koa/cors');
const mount = require('koa-mount');

require('./src/helpers/init_redis');
require('./src/helpers/init_mongodb');
const env = require('./src/environments');
const handlers = require('./src/handlers');
const { auth, account }= require('./src/routes');
// const accountRouter = require('./src/routes/account');

const app = new Koa();

handlers.forEach((h) => app.use(h));

app.use(CORS());
app.use(mount('/api/auth', auth));
app.use(mount('/api', account));

app.listen(env.PORT, () => console.log(`Server has been started on port ${env.PORT}`));
