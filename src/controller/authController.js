const UserModel = require( '../model/userModel' );
const bcrypt = require( 'bcryptjs' )
const jwt = require( 'jsonwebtoken' );
const { randomUUID } = require( 'crypto' );
const mongoose = require( 'mongoose' );

const { validationResult } = require( 'express-validator' );
const config = require( '../config' );

const signup = async ( req, res ) => {
    try {
        const error = validationResult( req )
        if ( !error.isEmpty() ) {
            return res.status( 400 ).send( { msg: error.array() } )
        }
        console.log( "entered try block" )
        const { username, password, email} = req.body;
        
        let existingUser = await UserModel.findOne( { email } )
        if ( existingUser == null ) {
            existingUser = await UserModel.findOne( { email } )
        }
        if ( existingUser ) {
            return res.status( 401 ).json( {
                success: false,
                message: "User Already Exist"
            } )
        } else {
            console.log( 'Received 1data:', { username, password } );
            const salt = bcrypt.genSaltSync( 10 );
            const hashpassword = bcrypt.hashSync( password, salt )
            const newUser = new UserModel( {
                userID: randomUUID(),
                username: username,
                email: email,
                password: hashpassword

            } )
            await newUser.save()
            return res.status( 200 ).json( {
                success: true,
                message: "Registration Done Successfully",
                data: res.data
            } );

        }


    }
    catch ( error ) {
        console.log( "sign up Issue" )
        if ( !res.headersSent ) {  // Check if headers have been sent
            return res.status( 500 ).json( {
                success: false,
                message: "Server Error"
            } );
        } else {
            console.error( "Headers already sent. Cannot send additional response." );
        }
    }

}
const login = async ( req, res ) => {
    try {
        const { email, password } = req.body;
        console.log( "entered try block" )
        const existingData = await UserModel.findOne( { email } )
        console.log( existingData )
        if ( existingData ) {
            const passwordMatch = await bcrypt.compare( password, existingData.password )
            if ( !passwordMatch ) {
                res.status( 401 ).send( { msg: "Password is wrong" } )
            }
            const token = jwt.sign( { _id: existingData.userID }, config.secret, { expiresIn: '1h' } )
            res.status( 200 ).send( {
                success: true,
                message: "Login Sucessfully",
                token
            } )

        }
        else {
            res.status( 404 ).send( { msg: "Your Account is not Registered " } )
        }

    }
    catch ( error ) {
        res.status( 501 ).send( { msg: error.message } )

    }

}
const updateUser = async (req, res) => {
    try {
      // Extract token from the headers
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
  
      // Destructure the fields to be updated from the request body
      const { username, email, oldPassword, newPassword } = req.body;
  
      // Find the user by userID
      const user = await UserModel.findOne({userID :userID});
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (username) user.username = username;
      if (username) user.email = email;
  
      // If oldPassword and newPassword are provided, validate and update the password
      if (oldPassword && newPassword) {
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Old password is incorrect' });
        }
        user.password = await bcrypt.hash(newPassword, 10); // Hash the new password
      }
  
      await user.save();
  
      return res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Update User Error:', error);
      return res.status(500).json({ message: 'An error occurred while updating user data' });
    }
  };
  
  




module.exports = {
    signup,
    login,
    updateUser

}