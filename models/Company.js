const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');

const roleSchema = new Schema({
    admin: [{ type: String }],
    dev: [{ type: String }]
});

const companySchema = new Schema({
    name: { type: String, unique: true },
    products: [{ type: String }],
    roles: roleSchema,
    companyKey: {
        type: String,
        default: uuidv4()
    }
});

module.exports = mongoose.model('Company', companySchema);
