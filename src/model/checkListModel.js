const mongoose = require( 'mongoose' );
const checkListSchema = new mongoose.Schema( {
    taskID: {
        type: String,
        required: true,
    },
    checkListID: {
        type: String,
        required: true,
        unique: true
    },
    isDone: {
        type: Boolean,
        required: true,
    },
    title: {
        type: String,
        required: true
    }



} )
module.exports = mongoose.model( 'CheckList', checkListSchema );
