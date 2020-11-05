const error  = require('http-errors');
const User   = require('../models/User');
const client = require('../helpers/init_redis');
const { authLoginSchema, authRegisterSchema } = require('../helpers/validation_schema');
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
} = require('../helpers/jwt');

exports.login = async (ctx) => {
    try {
        const reqValidate = await authLoginSchema.validateAsync(ctx.request.body);

        const user = await User.findOne({email: reqValidate.email});
        if (!user) ctx.throw(error.NotFound('User not registered.'));

        const isMatch = await user.isValidPassword(reqValidate.password);
        if (!isMatch) ctx.throw(error.Unauthorized('email or password not valid.'));

        const accessToken = await signAccessToken(user.id);
        const refreshToken = await signRefreshToken(user.id);

        ctx.status = 200;
        ctx.body = { accessToken, refreshToken };
    } catch (e) {
        if (e.isJoi === true) ctx.throw(error.BadRequest(e.message));
        ctx.throw(error.BadRequest('Invalid Username/Password'))
        ctx.body = { loginError: e.message };
    }
};

exports.register = async (ctx) => {
    try {
        const reqValidate = await authRegisterSchema.validateAsync(ctx.request.body);
        const candidate = await User.findOne({email: reqValidate.email});

        if (candidate) ctx.throw(400, error.Conflict(`${reqValidate.email} is already been registered.`));

        const user = new User(reqValidate);
        const savedUser = await user.save();
        const accessToken = await signAccessToken(savedUser.id);
        const refreshToken = await signRefreshToken(savedUser.id);

        ctx.status = 201;
        ctx.body = { accessToken, refreshToken };
    } catch (e) {
        if (e.isJoi) e.status = 422;
        { ctx.status = 422, ctx.body = { registerError: e.message } };
    }
};

exports.refreshToken = async (ctx) => {
    console.log('http://localhost/auth/api/refresh-token ');
    try {
        const { refreshToken } = ctx.request.body;
        if (!refreshToken) ctx.throw(error.BadRequest());
        const userId = await verifyRefreshToken(refreshToken);

        const accessToken = await signAccessToken(userId);
        const refToken = await signRefreshToken(userId);

        ctx.body ={ accessToken: accessToken, refreshToken: refToken };
    } catch (e) {
        ctx.body = { refreshError: e.message };
    }
};

exports.logout = async (ctx) => {
    try {
        const { refreshToken } = ctx.request.body;
        if (!refreshToken) throw error.BadRequest();
        const userId = await verifyRefreshToken(refreshToken);
        client.DEL(userId, (err, value) => {
            if (err) {
                ctx.throw(error.InternalServerError());
            }
            console.log(value);
            ctx.status = 204;
        });
    } catch (e) {
        ctx.body = { logoutError: e.message };
    }
};
