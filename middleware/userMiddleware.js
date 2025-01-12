const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const mongoose = require('mongoose');
require('dotenv').config();
const JWT_SECRET_KEY = "secret1234";

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
}

const authGuard = async(req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized access. Token missing or invalid.'});
        }
        
        const token = authHeader.replace('Bearer ', '');
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await User.findOne({userId: decode.id});

        console.log(user);
        if(!user){
            return res.status(401).json({message: "User Not Found"});
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error in authGuard:', error.message);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        } else {
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

module.exports = {generateToken, authGuard};