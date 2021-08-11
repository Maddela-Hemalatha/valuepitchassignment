const Joi = require('@hapi/joi');
require('dotenv').config();

const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('production', 'development', 'test', 'provision').default('development'),
    PORT: Joi.number().default(4040),
    JWT_SECRET: Joi.string().required().description('JWT Secret required'),
    DATABASE_LOCAL_HOST: Joi.string().required().description('Mongo DB host required'),
    DATABASE_NAME: Joi.string().required().description('DB name required'),
}).unknown().required();


const { error, value: envVars } = envSchema.validate(process.env);
if (error) {
    throw new Error(`config validation error: ${error.message}`);
}

const config = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    mongoDB : {
        host: envVars.DATABASE_LOCAL_HOST,
        db: envVars.DATABASE_NAME,
        collections: {
            users: "users",
            persons: "persons"
        }
    },
    jwtSecret: envVars.JWT_SECRET,
    BcryptSaltRounds: 12
}

module.exports = config;