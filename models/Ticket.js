const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
    title: {
        type: String,
        maxLength: [30]
    },
    assignedTo: [{ type: String }],
    company: { type: String },
    product: { type: String },
    picture: { type: String },
    description: {
        type: String,
        minLength: [30, 'Please include a detailed description'],
        required: true
    },
    priority: { type: Number },
    status: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    closedAt: { type: Date },
    createdBy: { type: String }
});

module.exports = mongoose.model('Ticket', ticketSchema);
