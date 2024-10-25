const mongoose = require( 'mongoose' );
const taskSchema = new mongoose.Schema( {
    taskID: {
        type: String,
        required: true,
        unique: true
    },
    createdBy: {
        type: String,
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    taskName: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    dueDate: Date,


} )
module.exports = mongoose.model( 'Task', taskSchema );
