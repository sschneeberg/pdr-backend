const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {
        type: String, 
        required: true,
        minLength: [8, 'Password must be at least 8 characters']
    },
    permissions: {type: String},
    company: [{type: String}]
})

module.exports = mongoose.model('User', userSchema);
