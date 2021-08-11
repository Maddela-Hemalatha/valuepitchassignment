const config = require('./server/config/config');
const app = require('./server/config/express');
const MONGO = require('./server/config/mongo');

async function startAPI() {

    try {
        await MONGO.connect();
        app.listen(config.port, () => {
            console.info(`Server started on port ${config.port} (${config.env})`);
        });
        return app

    } catch (error) {
        console.log('API ', new Error(error))
    }

}

module.exports = startAPI();