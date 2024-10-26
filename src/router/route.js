const express = require( 'express' )
const Router = express.Router;
const verifyToken = require( '../middleware/token.validation.js' )
const validateUser = require( '../middleware/user.validation.js' )

const {
    signup,
    login
} = require( '../controller/authController.js' )
const {
    createTask,
    addEmail,
    getTask

} = require( '../controller/appController.js' )


const test = () => {
    console.log( "test" )
}

const { body } = require( 'express-validator' )
const authRouter = Router();
authRouter.post( '/signup', validateUser, signup );
authRouter.post( '/login', login );
authRouter.post( '/createTask', createTask );
authRouter.post( '/addEmail', addEmail );
authRouter.post( '/getTask', getTask );



module.exports = authRouter
