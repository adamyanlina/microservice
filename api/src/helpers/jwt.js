const JWT = require('jsonwebtoken');
const error = require('http-errors');
const client = require('./init_redis');
const { tokens } = require('../environments');

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {};
            const secret = tokens.ACCESS_SECRET_TOKEN;
            const options = {
                expiresIn: '60s',
                audience: userId,
            };
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) reject(err);
                resolve(token);
            });
        });
    },
    verifyAccessToken: (ctx, next) => {
        if (!ctx.request.headers['authorization']) return next(error.Unauthorized());
        const token = ctx.request.headers['authorization'].split(' ')[1];
        JWT.verify(token, tokens.ACCESS_SECRET_TOKEN, (err, payload) => {
            if (err) {
                const message = err.name === 'JsonWebToken' ? 'Unauthorized' : err.message;
                return next(error.Unauthorized(message));
            }
            ctx.request.payload = payload;
            return next();
        });
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {};
            const secret = tokens.REFRESH_SECRET_TOKEN;
            const options = {
                expiresIn: '1y',
                audience: userId,
            };
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message());
                    // reject(error.InternalServerError());
                }
                client.SET(userId, token, (err, replay) => {
                    if (err) {
                        console.log("Don't SET: ", err.message);
                        reject(error.InternalServerError());
                        return;
                    }
                    resolve(token);
                });
            });
        });
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(refreshToken, tokens.REFRESH_SECRET_TOKEN, (err, payload) => {
                if (err) return reject(error.Unauthorized());
                const userId = payload.aud;
                client.GET(userId, (err, result) => {
                    if (err) {
                        console.log(err.message());
                        return reject(error.InternalServerError());
                    }
                    if (refreshToken === result) return resolve(userId);
                    reject(error.Unauthorized());
                });
            });
        });
    }
};
