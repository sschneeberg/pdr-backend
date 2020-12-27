const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const db = mongoose.connection;

//event listener to fire once connection opens for db and for all errors
db.once('open', () => {
    console.log(`connected to mongo db at ${db.host}: ${db.port}`);
});

db.on('error', (error) => {
    console.log(`Database error: \n ${error}`);
});

module.exports = {
    User: require('./User'),
    Company: require('./Company'),
    Comment: require('./Comment'),
    Ticket: require('./Ticket')
};
