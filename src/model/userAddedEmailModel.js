const mongoose = require( 'mongoose' );
const userAddedEmailSchema = new mongoose.Schema( {
    userID: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },

} )
module.exports = mongoose.model( 'UserAddedEmail', userAddedEmailSchema );
