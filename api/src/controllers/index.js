const Router = require('koa-router');

const auth = require('./auth');
//const account = require('./account');

const router = new Router().prefix('/api/auth');
//const routerClient = new Router().prefix('/');

router.use(auth);
//routerClient.use(account, verifyAccessToken);

module.exports = router;
