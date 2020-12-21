const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
    title: {
        type: String,
        maxLength: [20]
    },
    assignedTo: [{type: String}],
    company: {type: String},
    product: {type: String},
    picture: {type: String},
    description: {
        type: String,
        minLength: [30, 'Please include a detailed description'],
        required: true,
    },
    priority: {type: Number},
    status: {type: String},
    createdAt: {
        type: Date,
        default: new Date()
    },
    createdBy: {type: String}
})

module.exports = mongoose.model('Ticket', ticketSchema)