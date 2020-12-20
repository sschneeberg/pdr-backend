const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, require: true, unique: true },
    password: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('User', userSchema);
