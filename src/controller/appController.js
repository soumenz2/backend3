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


        console.log( req.body?.date )

        const newTask = new TaskModel( {
            taskID: randomUUID(),
            createdBy: userID,
            taskName: req.body?.title,
            priority: req.body?.priority,
            status: "TODO",
            dueDate: req.body?.date ? new Date( req.body?.date ) : null

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

const updateTask = async ( req, res ) => {
    try {
        let token = req.headers['authorization'];
        if ( !token ) {
            return res.status( 403 ).json( { message: 'No token provided' } );
        }
        token = token.split( ' ' )[1];

        let userID = null;
        jwt.verify( token, config.secret, ( err, decoded ) => {
            if ( err ) {
                return res.status( 401 ).json( { message: 'Invalid token' } );
            }
            userID = decoded?._id;
        } );

        const { taskID, title, status, checklist } = req.body;

        const task = await TaskModel.findOne( { taskID, createdBy: userID } );
        if ( !task ) {
            return res.status( 404 ).json( { message: 'Task not found' } );
        }

        // Update task properties
        task.taskName = title || task.taskName;
        task.priority;
        task.status = status || task.status;
        task.dueDate = dueDate ? new Date( dueDate ) : task.dueDate;

        await task.save();

        // Handle checklist updates
        const existingChecklists = await CheckListModel.find( { taskID: taskID } );
        let totalChecklistUpdated = 0;

        // Update, delete or add new checklist items
        for ( let eachChecklist of checklist ) {
            if ( eachChecklist.checkListID ) {
                // Update existing checklist item
                const checklistItem = existingChecklists.find(
                    ( item ) => item.checkListID === eachChecklist.checkListID
                );
                if ( checklistItem ) {
                    checklistItem.title = eachChecklist.title;
                    checklistItem.isDone = eachChecklist.isDone;
                    await checklistItem.save();
                    totalChecklistUpdated++;
                }
            } else {
                // Add new checklist item
                const newChecklistItem = new CheckListModel( {
                    taskID: taskID,
                    checkListID: randomUUID(),
                    title: eachChecklist.title,
                    isDone: eachChecklist.isDone,
                } );
                await newChecklistItem.save();
                totalChecklistUpdated++;
            }
        }

        // Remove deleted checklist items
        const checklistIDs = checklist.map( ( item ) => item.checkListID );
        const toDelete = existingChecklists.filter(
            ( item ) => !checklistIDs.includes( item.checkListID )
        );
        for ( let item of toDelete ) {
            await CheckListModel.findByIdAndDelete( item._id );
        }

        return res.status( 200 ).json( {
            message: "Task Updated",
            task,
            totalChecklistUpdated,
        } );

    } catch ( error ) {
        console.error( 'Error updating task:', error );
        return res.status( 400 ).json( { message: 'Internal error', error: JSON.stringify( error ) } );
    }
};





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

        const existingUser = await UserModel.findOne( { userID } )


        let todoList = []
        let backLogList = []
        let inProgressList = []
        let doneList = []

        const taskList = await UserTaskModel.find( { email: existingUser?.email } )


        console.log( taskList )


        for ( let i = 0; i < taskList.length; i++ ) {
            let eachTask = taskList[i]
            let taskDetails = await TaskModel.findOne( { taskID: eachTask?.taskID } )
            let checkList = await CheckListModel.find( { taskID: eachTask?.taskID } )

            console.log( taskDetails )

            let newTaskDetails = {
                taskID: taskDetails.taskID,
                createdBy: taskDetails.createdBy,
                taskName: taskDetails.taskName,
                priority: taskDetails.priority,
                status: taskDetails.status,
                dueDate: taskDetails.dueDate,
                createdOn: taskDetails.createdOn,
                checkList: checkList
            }

            if ( newTaskDetails?.dueDate && new Date( newTaskDetails?.dueDate ) > new Date() ) {
                newTaskDetails.status = "BACKLOG"
                backLogList.push( newTaskDetails )
            } else if ( newTaskDetails?.status == "TODO" ) {
                todoList.push( newTaskDetails )
            } else if ( newTaskDetails?.status == "IN-PROGRESS" ) {
                inProgressList.push( newTaskDetails )
            } else if ( newTaskDetails?.status == "DONE" ) {
                doneList.push( newTaskDetails )
            }
        }
        return res.status( 200 ).json( {
            message: "Data Fetched Successfully",
            task: {
                todo: todoList,
                backLog: backLogList,
                inProgress: inProgressList,
                done: doneList
            }
        } )

    } catch ( error ) {
        console.log( error )
        return res.status( 400 ).json( { message: 'Internal error', error: JSON.stringify( error ) } );
    }
}



const getEmail = async ( req, res ) => {
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

        const emailListAddedByUser = await UserAddEmailModel.find( { userID } )

        return res.status( 200 ).json( {
            message: "Data Fetched Successfully",
            email: emailListAddedByUser
        } )

    } catch ( error ) {
        console.log( error )
        return res.status( 400 ).json( { message: 'Internal error', error: JSON.stringify( error ) } );
    }
}


const assignTask = async ( req, res ) => {
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

        const newUserTask = new UserTaskModel( {
            email: req?.body?.email,
            taskID: req?.body?.taskID
        } )

        await newUserTask.save()



        return res.status( 200 ).json( {
            message: "Task Assigned Successfully"
        } )




    } catch ( error ) {
        console.log( error )
        return res.status( 400 ).json( { message: 'Internal error', error: JSON.stringify( error ) } );
    }
}




module.exports = {
    createTask,
    addEmail,
    getTask,
    getEmail,
    assignTask,
    updateTask
}