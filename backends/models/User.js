const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ]
        },
        password: {
            type: String,
            // Password is not required if users log in with Google
            required: false, 
        },
        role: {
            type: String,
            enum: ['Student', 'Admin'],
            default: 'Student'
        },
        branch: {
            type: String,
            required: function() { return this.role === 'Student'; }
        },
        googleId: {
            type: String,
            default: null
        },
        avatar: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
