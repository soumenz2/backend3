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

        const newUserTask1 = new UserTaskModel( {
            email: existingUser?.email,
            taskID: newTask?.taskID
        } )

        await newUserTask1.save()
        const newUserTask = new UserTaskModel( {
            email: req.body?.assignee,
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

const updateTask = async (req, res) => {
    try {
        let token = req.headers['authorization'];
        if (!token) {
            return res.status(403).json({ message: 'No token provided' });
        }
        token = token.split(' ')[1];

        let userID = null;
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            userID = decoded?._id;
        });

        console.log(userID);

        // Find the existing task by taskID
        const existingTask = await TaskModel.findOne({ taskID: req.body.taskID });
        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Update task details (excluding assignee and due date)
        existingTask.taskName = req.body?.title || existingTask.taskName;
        existingTask.priority = req.body?.priority || existingTask.priority;
        // Do not update the due date or assignee here

        // Save the updated task
        await existingTask.save();

        // Update existing checklists and add new ones
        let totalCheckListCreated = 0;

        for (const eachChecklist of req.body.checklist) {
            if (eachChecklist.checkListID) {
                // Update existing checklist item
                await CheckListModel.updateOne(
                    { checkListID: eachChecklist.checkListID },
                    { $set: { isDone: eachChecklist.isDone, title: eachChecklist.title } }
                );
            } else {
                // Create a new checklist item if it doesn't have a checkListID
                const newCheckList = new CheckListModel({
                    taskID: existingTask.taskID,
                    checkListID: randomUUID(),
                    isDone: eachChecklist.isDone || false,
                    title: eachChecklist.title || 'Untitled Checklist'
                });
                await newCheckList.save();
                totalCheckListCreated += 1;
            }
        }

        return res.status(200).json({
            message: "Task Updated",
            task: existingTask,
            totalCheckListCreated: totalCheckListCreated
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: 'Internal error', error: JSON.stringify(error) });
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

        const existingUser = await UserModel.findOne( { userID } )


        let todoList = []
        let backLogList = []
        let inProgressList = []
        let doneList = []




        const taskList = await UserTaskModel.find( { email: existingUser?.email } )


        console.log( taskList )




        const startOfWeek = new Date();
        startOfWeek.setHours( 0, 0, 0, 0 );
        startOfWeek.setDate( startOfWeek.getDate() - startOfWeek.getDay() );

        const endOfWeek = new Date();
        endOfWeek.setHours( 23, 59, 59, 999 );
        endOfWeek.setDate( startOfWeek.getDate() + 6 );

        const startOfMonth = new Date();
        startOfMonth.setDate( 1 );
        startOfMonth.setHours( 0, 0, 0, 0 );

        const endOfMonth = new Date( startOfMonth );
        endOfMonth.setMonth( startOfMonth.getMonth() + 1 );
        endOfMonth.setDate( 0 );
        endOfMonth.setHours( 23, 59, 59, 999 );

        const startOfDay = new Date();
        startOfDay.setHours( 0, 0, 0, 0 );

        const endOfDay = new Date();
        endOfDay.setHours( 23, 59, 59, 999 );




        console.log( "startOfWeek = " + startOfWeek + " endOfWeek = " + endOfWeek )
        console.log( "startOfMonth = " + startOfMonth + " endOfMonth = " + endOfMonth )
        console.log( "startOfDay = " + startOfDay + " endOfDay = " + endOfDay )


        for ( let i = 0; i < taskList.length; i++ ) {
            let eachTask = taskList[i]
            let taskDetails = null;

            if ( req.body?.filter == "TODAY" ) {
                taskDetails = await TaskModel.findOne( {
                    taskID: eachTask?.taskID, dueDate: {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    }
                } )
            } else if ( req.body?.filter == "MONTH" ) {
                taskDetails = await TaskModel.findOne( {
                    taskID: eachTask?.taskID, dueDate: {
                        $gte: startOfMonth,
                        $lte: endOfMonth,
                    }
                } )

            } else if ( req.body?.filter == "WEEK" ) {

                taskDetails = await TaskModel.findOne( {
                    taskID: eachTask?.taskID, dueDate: {
                        $gte: startOfWeek,
                        $lte: endOfWeek,
                    }
                } )
            } else {
                taskDetails = await TaskModel.findOne( {
                    taskID: eachTask?.taskID
                } )
            }


            if ( taskDetails == null ) {
                continue;
            }
            let checkList = await CheckListModel.find( { taskID: eachTask?.taskID } )
            let statusOptions = [];
            switch (taskDetails.status) {
                case "TODO":
                    statusOptions = ["IN-PROGRESS", "DONE", "BACKLOG"];
                    break;
                case "IN-PROGRESS":
                    statusOptions = ["DONE", "BACKLOG"];
                    break;
                case "DONE":
                    statusOptions = [];
                    break;
                case "BACKLOG":
                    statusOptions = ["TODO", "IN-PROGRESS"];
                    break;
            }


            let newTaskDetails = {
                taskID: taskDetails.taskID,
                createdBy: taskDetails.createdBy,
                taskName: taskDetails.taskName,
                priority: taskDetails.priority,
                status: taskDetails.status,
                dueDate: taskDetails.dueDate,
                createdOn: taskDetails.createdOn,
                checkList: checkList,
                statusOptions: statusOptions,
            }

            if ( newTaskDetails?.status == "BACKLOG"  ) {
               
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
const deleteTask = async (req, res) => {
    try {
      // Get token from headers
      let token = req.headers['authorization'];
      if (!token) {
        return res.status(403).json({ message: 'No token provided' });
      }
      token = token.split(' ')[1];
  
      // Verify token and extract userID
      let userID = null;
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }
        userID = decoded._id;
      });
  
      // Destructure taskID from req.query
      const { taskID } = req.query;
      if (!taskID) {
        return res.status(400).json({ message: 'Task ID is required' });
      }
  
      // Check if the task exists and is created by the user
      const task = await TaskModel.findOne({ taskID, createdBy: userID });
      if (!task) {
        return res.status(404).json({ message: 'Task not found or unauthorized' });
      }
  
      // Delete the task
      await TaskModel.deleteOne({ taskID });
  
      // Delete all checklist items associated with the task
      const deletedChecklistCount = await CheckListModel.deleteMany({ taskID });
  
      // Optionally, delete associated UserTask records
      await UserTaskModel.deleteMany({ taskID });
  
      return res.status(200).json({
        message: 'Task and associated checklist deleted successfully',
        deletedChecklistCount: deletedChecklistCount.deletedCount,
      });
    } catch (error) {
      console.log('Delete Task Error:', error);
      return res.status(500).json({ message: 'An error occurred while deleting the task', error });
    }
  };



module.exports = {
    createTask,
    addEmail,
    getTask,
    getEmail,
    assignTask,
    updateTask,
    deleteTask
    
}