const Router = require('koa-router');
const { home } = require('../controllers/account');
const { verifyAccessToken } = require('../helpers/jwt');

const router = new Router();

// localhost:8080/api/...
router.get('/home', verifyAccessToken, home);

module.exports = router.routes();
