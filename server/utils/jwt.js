let jwt_services = module.exports;

const config = require('../config/config');
const jwt = require('jsonwebtoken');

jwt_services.create = (obj) => {
    if(obj.email && obj._id && obj.name){
        return jwt.sign({
            _id: obj._id,
            name: obj.name,
            email: obj.email
        }, config.jwtSecret, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
    } else {
        return null;
    }
}
