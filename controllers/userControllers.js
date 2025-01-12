const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../model/userModel');
const {generateToken} = require('../middleware/userMiddleware');

const isBcryptHash = (password) => {
    const bcryptRegex = /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/;
    return bcryptRegex.test(password);
}

const createUser = async (req, res) => {
    const {name, email, mobile, profilePicture,metadata, password} = req.body;

    if(!name){
        return res.status(400).json({message: "Please Provide Valid Name"});
    }
    if(!email){
        return res.status(400).json({message: "Please Provide Valid Email"});
    }
    if(!mobile){
        return res.status(400).json({message: "Please Provide Valid Phone Number"});
    }
    if(!password){
        return res.status(400).json({message: "Please Provide Valid Passwordd"})
    }

    const oldDetails = await User.findOne({email: email});

    if(oldDetails){
        return res.status(400).json({message: "User Already Exists"});
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        name: name,
        email: email,
        mobile: mobile,
        profilePicture: profilePicture !== "" ? profilePicture : "",
        metadata: metadata !== "" ? metadata : "",
        password: hashedPassword
    }); 

    try {
        await newUser.save();
        res.status(200).json({message: 'User Created Successfully.'});
    } catch (error) {
        res.status(500).json({message: 'Server Error', error: error});
    }

}

const updateUser = async (req, res) => {
    const { userId } = req.params;
    const updatedData = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).send({ message: 'Invalid User ID.' });
    }

    if(!isBcryptHash(updatedData.password)){
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(updatedData.password, salt);
        updatedData.password = hashedPassword;
    }

    try {
        const updateUserId = new mongoose.Types.ObjectId(userId);
        const updatedUser = await User.findOneAndUpdate(
            { userId: updateUserId },
            { $set: updatedData },
            { new: true, runValidators: true}
        );

        if (updatedUser) {
            res.status(200).json({
                message: `User with UserId: ${userId} updated successfully.`,
                data: updatedUser,
            });
        } else {
            res.status(404).json({ message: 'UserId not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error, failed to update user.', error: error.message });
    }
};


const deleteUser = async (req, res) => {
    const {userIds} = req.body;

    console.log(userIds);
    console.log(Array.isArray(userIds));
    
    if(!userIds || !Array.isArray(userIds) || userIds.length === 0){
        return res.status(400).json({message: "Please provide a valid userId to proceed."});
    }

    try {
        const deletedUsers = await User.deleteMany({userId: {$in: userIds}});

        if(deletedUsers.deletedCount > 0){
            res.status(200).json({message: `${deletedUsers.deletedCount} users deleted successfully.`});
        } else {
            res.status(404).json({message: 'Failed to Delete the Users.'});
        }
    } catch (error) {
        res.status(500).json({message: 'Server Error', error: error});
    }
}

const getUser = async (req, res) => {
    const Email = req.params.email;

    try {
        const response = await User.findOne({email: Email});

        if(response){
            res.status(200).json({message: `User generated successfully`, data: response});
        } else {
            res.status(404).json({message: "Error generating the required data."});
        }
    } catch (error) {
        res.status(500).json({message: 'Server Error', error: error.message});
    }
}

const getAllUsers = async (req, res) => {
    try {
        const getAllData = await User.find({});

        if(getAllData.length !== 0){
            res.status(200).json({message: "All Data Generated Successfully.", data: getAllData});
        } else {
            res.status(404).json({message: "Error: No Data Generated"});
        }
    } catch (error) {
        res.status(500).json({message: "Server Error", error: error.message});
    }
}

const registerUser = async (req, res) => {
    const {name, email, mobile, profilePicture,metadata, password} = req.body;

    if(!name || !email || !mobile || !password){
        return res.status(400).json({message: "Please Fill in the mandatory fields."});
    }

    const oldDetails = await User.findOne({email: email});

    if(oldDetails){
        return res.status(400).json({message: "User Already Exists"});
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        name: name,
        email: email,
        mobile: mobile,
        profilePicture: profilePicture !== "" ? profilePicture : "",
        metadata: metadata !== "" ? metadata : "",
        password: hashedPassword
    }); 

    try {
        await newUser.save();
        res.status(200).json({message: 'User Created Successfully.'});
    } catch (error) {
        res.status(500).json({message: 'Server Error', error: error});
    }
}

const loginUser = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({email: email});

        if(!user){
            return res.status(404).json({message: 'Invalid email or password'});
        }

        const matchPassword = await bcrypt.compare(password, user.password);
        if(!matchPassword){
            return res.status(400).json({message: 'Invalid credentials'});
        }

        const token = generateToken(user.userId);
        res.status(200).json({message: 'Login Successful.', user, token});
    } catch (error) {
        res.status(500).json({message: 'Server Error.', error: error});
    }
}

module.exports = {createUser, updateUser, deleteUser, getUser, getAllUsers, loginUser, registerUser};