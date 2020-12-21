const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    ticket: {type: String},
    comment: {type: String},
    commentBy: {type: String},
    createdAt: {
        type: Date,
        default: new Date()
    },
})

module.exports = mongoose.model('Comment', commentSchema)