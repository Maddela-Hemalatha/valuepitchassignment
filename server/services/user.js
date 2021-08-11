const user = module.exports;

const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

const config = require('../config/config');
const jwt = require('../utils/jwt');
const MDB = new (require('../config/mongo')).op
const collections = config.mongoDB.collections;

user.register = async (req, res) => {
    try {

        const schema = Joi.object().keys({
            name: Joi.string().min(3).max(50).required(),
            email: Joi.string().email({ minDomainSegments: 2 }).required().pattern(new RegExp('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$')),
            password: Joi.string().min(8).max(50).required()
        });

        const { error, value } = await schema.validateAsync(req.body);
        if (error) res.status(400).send({ message: 'Please provide valid parameters' });

        // check email exists 
        const exists = await MDB.findOne(collections.users, { email: req.body.email });
        console.log(exists);
        if (exists) res.status(401).send({ message: 'Email already exists' });

        const salt = bcrypt.genSaltSync(config.BcryptSaltRounds);
        req.body.password = bcrypt.hashSync(req.body.password, salt);
        await MDB.insertOne(collections.users, req.body);

        res.status(200).send({ message: 'User successfully registered!!' });

    } catch (error) {
        console.log('error in register', error.message);
        res.status(500).send(error.message);
    }
}

user.login = async (req, res) => {
    try {
        const schema = Joi.object().keys({
            email: Joi.string().email({ minDomainSegments: 2 }).required().pattern(new RegExp('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$')),
            password: Joi.string().min(8).max(50).required()
        });

        const { error, value } = await schema.validateAsync(req.body);
        if (error) return res.status(400).send({ message: 'Please provide valid parameters' });

        // check email exists 
        let user = await MDB.findOne(collections.users, { email: req.body.email });
        console.log(user);
        if (!user) return res.status(401).send({ message: 'Email does\'t exists' });

        const validPassword = await bcrypt.compareSync(req.body.password, user.password);
        if (!validPassword) return res.status(400).send('Invalid email or password');

        const token = jwt.create({
            _id: user._id,
            name: user.name,
            email: user.email
        });
        res.cookie('access_token', token);
        return res.status(200).send({
            data: _.pick(user, ['name', 'email', 'address', 'dob', 'country', 'avatar'])
        });


    } catch (error) {
        console.log('error in login', error);
        return res.status(500).send(error.message);
    }
}