const jwt = require('jsonwebtoken');
const secretkey = process.env.SECRET_KEY;
const User = require('../models/User');

function verifyToken(req, res, next) {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: "No token provided!" });
        }

        jwt.verify(token.split(" ")[1], secretkey, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Unauthorized. Invalid Token" });
            }
            req.user = decoded; // Fixed variable name from 'verified' to 'decoded'
            next();
        });
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized. Invalid Token" });
    }
}

// Export the function directly
module.exports = verifyToken;