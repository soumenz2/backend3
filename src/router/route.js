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
    updateTask,
    addEmail

} = require( '../controller/appController.js' )


const test = () => {
    console.log( "test" )
}

const { body } = require( 'express-validator' )
const authRouter = Router();
authRouter.post( '/signup', validateUser, signup );
authRouter.post( '/login', login );
authRouter.post( '/createTask', createTask );
authRouter.post( '/updateTask', updateTask );
authRouter.post( '/addEmail', addEmail );



module.exports = authRouter
