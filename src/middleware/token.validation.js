const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyToken = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ msg: 'No token provided' });
    }

  
    const token = authorization.split(' ')[1]; 
    
    if (!token) {
        return res.status(401).json({ msg: 'Token is missing or invalid' });
    }

    try {
       
        const verified = jwt.verify(token, config.secret);
        req.user = verified; 
        next();
    } catch (err) {
      
        return res.status(401).json({ msg: 'Invalid token', error: err.message });
    }
};

module.exports = verifyToken;
