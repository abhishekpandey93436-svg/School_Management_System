const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @desc    Step 1 — Send OTP to verify email before registration
// @route   POST /api/auth/send-otp
const sendOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User with this email already exists. Please login.' });

    // Delete any old OTPs for this email
    await OTP.deleteMany({ email });

    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    await OTP.create({ email, otp: hashedOtp });

    try {
        await sendOTPEmail(email, otp);
        if (process.env.NODE_ENV === 'development') {
             console.log(`\n================================`);
             console.log(`[DEV MODE] OTP Generated for ${email}: ${otp}`);
             console.log(`================================\n`);
        }
        res.status(200).json({ message: `OTP sent! (Dev Mode OTP: ${otp})` });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
             console.log(`\n================================`);
             console.log(`[DEV MODE - EMAIL BYPASS] OTP for ${email}: ${otp}`);
             console.log(`(Configure EMAIL_USER in .env to actually send emails)`);
             console.log(`================================\n`);
             return res.status(200).json({ message: `Dev Bypass! Use OTP: ${otp}` });
        }
        await OTP.deleteMany({ email });
        res.status(500).json({ message: 'Failed to send OTP email. Check email settings.' });
    }
};

// @desc    Step 2 — Verify OTP and complete registration
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    const { name, email, password, branch, role, otp } = req.body;

    if (!name || !email || !password || !otp) {
        return res.status(400).json({ message: 'All core fields and OTP are required.' });
    }

    if (role === 'Student' && !branch) {
        return res.status(400).json({ message: 'Please select your department branch.' });
    }

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });

    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isOtpValid) return res.status(401).json({ message: 'Invalid OTP. Please try again.' });

    await OTP.deleteMany({ email });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name, email, password: hashedPassword,
        branch, role: role || 'Student'
    });

    if (user) {
        try { await sendWelcomeEmail(user.email, user.name); } catch (e) { console.error('Welcome email failed:', e.message); }

        res.status(201).json({
            _id: user._id, name: user.name, email: user.email,
            role: user.role, branch: user.branch,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data.' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id, name: user.name, email: user.email,
            role: user.role, branch: user.branch,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password.' });
    }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
};

// @desc    Update user profile (Name, Branch)
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.branch = req.body.branch || user.branch;
    
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    res.json({
        _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
        role: updatedUser.role, branch: updatedUser.branch,
        token: generateToken(updatedUser._id),
    });
};

module.exports = { sendOTP, registerUser, loginUser, getMe, updateProfile };
