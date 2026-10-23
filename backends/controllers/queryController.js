const Query = require('../models/Query');
const User = require('../models/User');
const { sendQueryAnsweredEmail } = require('../services/emailService');
const asyncHandler = require('express-async-handler');

// @desc    Create new query
// @route   POST /api/queries
const createQuery = asyncHandler(async (req, res) => {
    const { title, description, category, priority } = req.body;
    if (!title || !description || !category) {
        return res.status(400).json({ message: 'Title, description, and category are required.' });
    }
    
    let attachment = null;
    if (req.file) {
        attachment = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    const query = await Query.create({
        title, description, category,
        priority: priority || 'Normal',
        studentId: req.user._id,
        branch: req.user.branch || 'General',
        attachment
    });
    res.status(201).json(query);
});

// @desc    Get all queries with optional filters (Admin)
// @route   GET /api/queries?status=Open&category=IT&branch=CSE&priority=Urgent
const getQueries = async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.branch) filter.branch = req.query.branch;
    if (req.query.priority) filter.priority = req.query.priority;

    const queries = await Query.find(filter)
        .populate('studentId', 'name email branch')
        .populate('answeredBy', 'name')
        .sort({ createdAt: -1 });
    res.json(queries);
};

// @desc    Get logged-in student's queries
// @route   GET /api/queries/myqueries
const getMyQueries = async (req, res) => {
    const queries = await Query.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.json(queries);
};

// @desc    Get admin analytics
// @route   GET /api/queries/analytics
const getAnalytics = async (req, res) => {
    const total = await Query.countDocuments();
    const open = await Query.countDocuments({ status: 'Open' });
    const inProgress = await Query.countDocuments({ status: 'In-Progress' });
    const resolved = await Query.countDocuments({ status: 'Resolved' });
    const urgent = await Query.countDocuments({ priority: 'Urgent', status: { $ne: 'Resolved' } });
    const totalStudents = await User.countDocuments({ role: 'Student' });

    const byCategory = await Query.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const byBranch = await Query.aggregate([
        { $group: { _id: '$branch', count: { $sum: 1 } } }
    ]);

    res.json({ total, open, inProgress, resolved, urgent, totalStudents, byCategory, byBranch });
};

// @desc    Answer a query (Admin)
// @route   PUT /api/queries/:id/answer
const answerQuery = async (req, res) => {
    const { answer, status } = req.body;
    if (!answer) return res.status(400).json({ message: 'Answer is required.' });

    const query = await Query.findById(req.params.id).populate('studentId', 'name email');
    if (!query) return res.status(404).json({ message: 'Query not found.' });

    query.answer = answer;
    query.status = status || 'Resolved';
    query.answeredBy = req.user._id;
    const updated = await query.save();

    try {
        await sendQueryAnsweredEmail(
            query.studentId.email,
            query.studentId.name,
            query.title,
            answer
        );
    } catch (e) { console.error('Answer email failed:', e.message); }

    res.json(updated);
};

// @desc    Update query status only (Admin)
// @route   PUT /api/queries/:id/status
const updateStatus = async (req, res) => {
    const { status } = req.body;
    const allowed = ['Open', 'In-Progress', 'Resolved'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status.' });

    const query = await Query.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );
    if (!query) return res.status(404).json({ message: 'Query not found.' });
    res.json(query);
};

// @desc    Add a comment to a query (Two-Way thread)
// @route   POST /api/queries/:id/comment
// @access  Private
const commentQuery = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const query = await Query.findById(req.params.id);

    if (!query) {
        res.status(404);
        throw new Error('Query not found');
    }

    if (query.studentId && query.studentId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        res.status(403);
        throw new Error('Not authorized to comment on this query');
    }

    const comment = {
        user: req.user._id,
        name: req.user.name,
        role: req.user.role,
        text
    };

    if (!query.comments) {
        query.comments = [];
    }

    query.comments.push(comment);
    await query.save();

    const updated = await Query.findById(req.params.id)
        .populate('studentId', 'name email')
        .populate('answeredBy', 'name');
        
    res.json(updated);
});

module.exports = { createQuery, getQueries, getMyQueries, getAnalytics, answerQuery, updateStatus, commentQuery };
