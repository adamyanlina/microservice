const Router = require('koa-router');
const { login, register, refreshToken, logout } = require('../controllers/auth');

const router = new Router();

// localhost:8080/api/auth/...
router.post('/login', login)
    .post('/register', register)
    .post('/refresh-token', refreshToken)
    .delete('/logout', logout);

module.exports = router.routes();
