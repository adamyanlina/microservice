const catchMongooseErrors = require('./catch-mongoose-errors');
const bodyParser = require('./body-parser');
const errors = require('./errors');

module.exports = [
    bodyParser,
    errors,
    catchMongooseErrors,
];
