const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, require: true, unique: true },
    password: {
        type: String,
        required: true,
        minLength: [8, 'Password must be at least 8 characters']
    },
    dateCreated: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('User', userSchema);
