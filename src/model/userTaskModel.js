const mongoose = require( 'mongoose' );
const userTaskSchema = new mongoose.Schema( {
    taskID: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },

} )
module.exports = mongoose.model( 'UserTask', userTaskSchema );
