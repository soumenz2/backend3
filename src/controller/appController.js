const UserModel = require( '../model/userModel' );
const TaskModel = require( '../model/taskModel' );
const CheckListModel = require( '../model/checkListModel' );
const UserTaskModel = require( '../model/userTaskModel' );
const UserAddEmailModel = require( '../model/userAddedEmailModel' );




const bcrypt = require( 'bcryptjs' )
const jwt = require( 'jsonwebtoken' );
const { randomUUID } = require( 'crypto' );
const mongoose = require( 'mongoose' );

const { validationResult } = require( 'express-validator' );
const config = require( '../config' );



const createTask = async ( req, res ) => {
    try {
        let token = req.headers['authorization'];
        if ( !token ) {
            return res.status( 403 ).json( { message: 'No token provided' } );
        }
        token = token?.split( ' ' )[1]

        let userID = null
        jwt.verify( token, config.secret, ( err, decoded ) => {
            if ( err ) {
                return res.status( 401 ).json( { message: 'Invalid token' } );
            }
            userID = decoded?._id;
        } );


        console.log( userID )

        const existingUser = await UserModel.findOne( { userID } )



        const newTask = new TaskModel( {
            taskID: randomUUID(),
            createdBy: userID,
            taskName: req.body?.title,
            priority: req.body?.priority,
            status: req.body?.status,
            dueDate: new Date()

        } )

        await newTask.save()


        let totalCheckLictCreated = 0

        await req?.body.checklist?.map( async ( eachChecklist ) => {
            let newCheckList = new CheckListModel( {
                taskID: newTask?.taskID,
                checkListID: randomUUID(),
                isDone: eachChecklist?.isDone,
                title: eachChecklist?.title
            } )
            totalCheckLictCreated += 1

            await newCheckList.save()

        } )


        const newUserTask = new UserTaskModel( {
            email: existingUser?.email,
            taskID: newTask?.taskID
        } )

        await newUserTask.save()

        return res.status( 200 ).json( {
            message: "Task Created",
            task: newTask,
            totalCheckLictCreated: totalCheckLictCreated
        } )

    } catch ( error ) {
        console.log( error )
        return res.status( 400 ).json( { message: 'Internal error', error: JSON.stringify( error ) } );
    }
}







const addEmail = async ( req, res ) => {
    try {
        let token = req.headers['authorization'];
        if ( !token ) {
            return res.status( 403 ).json( { message: 'No token provided' } );
        }
        token = token?.split( ' ' )[1]

        let userID = null
        jwt.verify( token, config.secret, ( err, decoded ) => {
            if ( err ) {
                return res.status( 401 ).json( { message: 'Invalid token' } );
            }
            userID = decoded?._id;
        } );


        console.log( userID )


        const alreadyExistingDate = await UserAddEmailModel.findOne( { userID: userID, email: req.body?.email } )


        if ( alreadyExistingDate ) {
            return res.status( 402 ).json( { message: 'Email already exist' } );
        }



        const newUserAddEmail = new UserAddEmailModel( {
            userID: userID,
            email: req.body?.email
        } )


        await newUserAddEmail.save()



        return res.status( 200 ).json( {
            message: "Email added",

        } )

    } catch ( error ) {
        console.log( error )
        return res.status( 400 ).json( { message: 'Internal error', error: JSON.stringify( error ) } );
    }
}


const getTask = async ( req, res ) => {
    try {
        let token = req.headers['authorization'];
        if ( !token ) {
            return res.status( 403 ).json( { message: 'No token provided' } );
        }
        token = token?.split( ' ' )[1]

        let userID = null
        jwt.verify( token, config.secret, ( err, decoded ) => {
            if ( err ) {
                return res.status( 401 ).json( { message: 'Invalid token' } );
            }
            userID = decoded?._id;
        } );


        console.log( userID )

        const existingTask = await TaskModel.findOne( { userID } )


        await newTask.save()


        let totalCheckLictCreated = 0

        await req?.body.checklist?.map( async ( eachChecklist ) => {
            let newCheckList = new CheckListModel( {
                taskID: newTask?.taskID,
                checkListID: randomUUID(),
                isDone: eachChecklist?.isDone,
                title: eachChecklist?.title
            } )
            totalCheckLictCreated += 1

            await newCheckList.save()

        } )




        return res.status( 200 ).json( {
            message: "Task Created",
            task: newTask,
            totalCheckLictCreated: totalCheckLictCreated
        } )

    } catch ( error ) {
        console.log( error )
        return res.status( 400 ).json( { message: 'Internal error', error: JSON.stringify( error ) } );
    }
}




module.exports = {
    createTask,
    addEmail
}