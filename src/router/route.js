const express = require( 'express' )
const Router = express.Router;
const verifyToken = require( '../middleware/token.validation.js' )
const validateUser = require( '../middleware/user.validation.js' )

const {
    signup,
    login,
    updateUser,
    getuser
} = require( '../controller/authController.js' )
const {
    createTask,
    addEmail,
    getTask,
    getEmail,
    assignTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTaskCounts,
    getTaskByID,
    updateTaskChecklist
    
   

} = require( '../controller/appController.js' )


const test = () => {
    console.log( "test" )
}

const { body } = require( 'express-validator' )
const authRouter = Router();
authRouter.post( '/signup', validateUser, signup );
authRouter.post( '/login', login );
authRouter.post( '/createTask', createTask );
authRouter.put( '/updateTask', updateTask );
authRouter.post( '/addEmail', addEmail );
authRouter.post( '/getTask', getTask );
authRouter.post( '/assignTask', assignTask );
authRouter.get( '/getEmail', getEmail );
authRouter.delete('/deleteTask', deleteTask);
authRouter.put('/updateUser', updateUser);
authRouter.put('/updateTaskChecklist', updateTaskChecklist);
authRouter.put( '/updateTaskStatus', updateTaskStatus );
authRouter.get( '/getTaskCounts', getTaskCounts );
authRouter.get( '/getuser', getuser );
authRouter.get( '/getTaskByID', getTaskByID );



module.exports = authRouter
