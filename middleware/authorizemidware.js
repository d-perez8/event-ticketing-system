//to make sure that user or admin can interact with system appropriately based on routes
const jwt = require('jsonwebtoken');

const authorizemidware = (req, res, next) => {
    // Check for token in the authorization header
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(403).json({message: 'Token is required'});
    }

    //verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({message: 'Invalid token'});
        }

        //adds user to request
        req.user = decoded;
        next();//move back to router logic
    });
};

module.exports = authorizemidware;