const mongoose = require('mongoose');

const { MONGO_ID, MONGO_PASSWORD, NODE_ENV } = process.env;
const MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@localhost:27017/admin`;

module.exports = () => {
    const connect = () => {
        if (NODE_ENV !== 'production') {
            mongoose.set('debug', true);
        }
        mongoose.connect(MONGO_URL, {
            dbName: 'gifchat',
        }, (error) => {
            if(error) {
                console.log('MongoDB Connecting Error', error);
            } else {
                console.log('Successfully connected with MongoDB');
            }
        });
    };

    connect();

    mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error', error);
    });

    mongoose.connection.on('disconnected', () => {
        console.error('Mongodb is disconnected, Try to reconnect');
        connect();
    });

    require('./chat');
    require('./room');
};


