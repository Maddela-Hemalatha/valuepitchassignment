let mongoDB = module.exports

const MongoClient = require('mongodb').MongoClient;
const config = require('./config');

const HOST = config.mongoDB.host;
const DBNAME = config.mongoDB.db;
const client = new MongoClient(HOST, {
    useNewUrlParser: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 500,
    useUnifiedTopology: true
});

let db = client.connect()

mongoDB.connect = () => {
    return new Promise((resolve, reject) => {
        db.then(() => {
            console.log('MongoDB connected');
            db = client.db(DBNAME);
            return resolve();
        }).catch((mongoConnectError) => {
            console.error('MongoDB native driver connection error', mongoConnectError);
            reject()
        });
    });
}

mongoDB.op = function() {
    this.insertOne = function (collection, query) {
        return db.collection(collection).insertOne(query);
    }

    this.findOne = function (collection, query, projection = {}) {
        return db.collection(collection).findOne(query, projection);
    }

    this.find = function (collection, query) {
        return db.collection(collection).find(query).project({password: 0}).toArray();
    }

    this.updateOne = function (collection, query) {
        return db.collection(collection).updateOne(query.find, query.update);
    }

    this.aggregate = function (collection, query) {
        return db.collection(collection).aggregate(query).toArray()
    }
}