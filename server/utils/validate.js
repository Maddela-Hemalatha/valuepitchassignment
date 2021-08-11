const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const _ = require('lodash');
const MDB = new (require('../config/mongo')).op
const collections = config.mongoDB.collections;

module.exports = async (req, res, next) => {
    // 1) Getting token and check if it's there
    console.log(req.headers.access_token);
    let token;
    if(req.headers.access_token && req.headers.access_token.startsWith('Bearer')){
        token = req.headers.access_token.split(' ')[1];
    }

    if(!token) return res.status(401).send('Your are not logged in! Please log in to get access.');

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, config.jwtSecret);

    // 3) Check if user still exists
    const user = await MDB.findOne(collections.users, { email: decoded.email });
    if (!user) return res.status(400).send({ message: 'The user beloging to this token does no longer exist.' });

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = _.pick(user, ['name', 'email', 'address', 'dob', 'country', 'avatar']);
    next();
};