const person = module.exports;

const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

const config = require('../config/config');
const MDB = new (require('../config/mongo')).op
const collections = config.mongoDB.collections;

person.create = async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ 'message': 'please upload image' });

        // The form should have fields for name, email, dob, avatar, address and country List of Persons 
        const schema = Joi.object().keys({
            name: Joi.string().min(3).max(50).required(),
            email: Joi.string().email({ minDomainSegments: 2 }).required().pattern(new RegExp('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$')),
            dob: Joi.string().required(),
            avatar: Joi.string().required(),
            address: Joi.string().max(50).required(),
            country: Joi.string().required()
        });

        req.body.avatar = req.headers.host+'/'+req.file.path;

        const { error, value } = await schema.validateAsync(req.body);
        if (error) return res.status(400).send({ message: 'Please provide valid parameters' });

        // check email exists 
        const exists = await MDB.findOne(collections.persons, { email: req.body.email });
        console.log(exists);
        if (exists) return res.status(401).send({ message: 'Email already exists' });
        else await MDB.insertOne(collections.persons, req.body);

        return res.status(200).send({ message: 'new person created successfully!!' });

    } catch (error) {
        console.log('error in creation', error.message);
        return res.status(500).send(error.message);
    }
}

person.getPerson = async (req, res) => {
    try {

        let schema = Joi.object().keys({
            email: Joi.string().email({ minDomainSegments: 2 }).pattern(new RegExp('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$')),
        });

        const { error, value } = await schema.validateAsync(req.params);
        if (error) return res.status(400).send({ message: 'Please provide valid parameters' });

        let user = await MDB.findOne(collections.persons, { email: req.params.email });
        if (!user) return res.status(401).send({ message: 'Email does\'t exists' });
        return res.status(200).send({
            data: { ..._.pick(user, ['name', 'email', 'address', 'dob', 'country', 'avatar']) }
        });

    } catch (error) {
        console.log(JSON.stringify(error));
        return res.status(500).send({ message: 'Something went wrong!!' });
    }
}

person.getList = async (req, res) => {
    try {
        let persons = await MDB.find(collections.persons);
        if (!persons.length) res.status(200).send({ data: [] });
        return res.status(200).send({ data: persons });
    } catch (error) {
        console.log(JSON.stringify(error));
        return res.status(500).send({ message: 'Something went wrong!!' });
    }
}

person.edit = async (req, res) => {
    try {
        console.log('jkdfkgfk', req.file,req.body);

        let schema = Joi.object().keys({
            email: Joi.string().email({ minDomainSegments: 2 }).pattern(new RegExp('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$')),
        });

        const { error, value } = await schema.validateAsync(req.params);
        if (error) return res.status(400).send({ message: 'Please provide valid parameters' });

        // check email exists 
        let user = await MDB.findOne(collections.persons, { email: req.params.email });
        console.log(user);
        if (!user) return res.status(401).send({ message: 'Email does\'t exists' });

        let updateobj = {};
        if (req.body.name) updateobj.name = req.body.name;
        if (req.body.dob) updateobj.dob = req.body.dob;
        if (req.file) updateobj.avatar = req.headers.host + '/' + req.file.path;
        if (req.body.address) updateobj.address = req.body.address;
        if (req.body.country) updateobj.country = req.body.country;

        console.log(updateobj, Object.keys(updateobj).length)
        if(Object.keys(updateobj).length){
            let query = {
                find: {
                    email: req.params.email
                },
                update: { $set : updateobj }
            }
    
            console.log(query)
            MDB.updateOne(collections.persons, query);
            return res.status(201).send({ message: 'Succussfully updated ' });
        }
        return res.status(401).send({ message: 'No modifications' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Something went wrong!!' });
    }
}

person.count = async (req, res) => {
    try {
        const data = await MDB.aggregate(collections.persons, [
            {
                $group: {
                    _id: '$country',
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log(data);
        return res.status(200).send({ data: data });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Something went wrong!!' });
    }
}
