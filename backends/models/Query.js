const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title for your query'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters']
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
        },
        studentId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        branch: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true,
            enum: ['Academics', 'Fees', 'Exams', 'Hostel', 'IT', 'Other'],
            default: 'Other'
        },
        priority: {
            type: String,
            enum: ['Low', 'Normal', 'Urgent'],
            default: 'Normal'
        },
        status: {
            type: String,
            enum: ['Open', 'In-Progress', 'Resolved'],
            default: 'Open'
        },
        attachment: {
            type: String,
            default: null
        },
        comments: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String,
            role: String,
            text: String,
            date: { type: Date, default: Date.now }
        }],
        answeredBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Query', querySchema);
