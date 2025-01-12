const mongoose = require('mongoose');
require('dotenv').config();
const USERNAME = "demouser1" 
const PASSWORD = "Demo@123"
const uri = `mongodb+srv://${USERNAME}:${encodeURIComponent(PASSWORD)}@cluster0.bpncd.mongodb.net/manageusers`;

const connect = async () => {
    try {
        await mongoose.connect(uri);
        console.log('DB connected');
    } catch (error) {
        console.log(`Error: ${error}`);
        await mongoose.disconnect();
    }
}

connect();

module.exports = connect;