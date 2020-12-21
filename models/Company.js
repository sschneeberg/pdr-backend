const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    admin: [{type: String}],
    dev: [{type: String}]
})

const companySchema = new Schema({
    name: {type: String, unique: true},
    products: [{type: String}],
    roles: roleSchema,
    companyKey: {type: String}
})

module.exports = mongoose.model('Company', companySchema);