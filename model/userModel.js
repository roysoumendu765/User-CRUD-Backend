const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    mobile: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Mobile number must be 10 digits'],
    },
    profilePicture: {
        type: String,
        default: null,
    },
    metadata: {
        type: String,
        default: null
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
}, {
    timestamps: true, 
});

const User = mongoose.model('User', userSchema);

module.exports = User;
