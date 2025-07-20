import httpStatus from 'http-status';
import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth.js';

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                message: 'Email and password are required' 
            });
        }

        // Find user by email or username
        const user = await User.findOne({ 
            $or: [{ email }, { username: email }] 
        });

        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Compare passwords using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(httpStatus.UNAUTHORIZED).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Return success response with token and user data
        return res.status(httpStatus.OK).json({ 
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                preferences: user.preferences
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: 'Something went wrong during login' 
        });
    }
};

const register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Validate input
        if (!name || !username || !email || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                message: 'All fields are required' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                message: 'Invalid email format' 
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                message: 'Password must be at least 6 characters long' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(httpStatus.CONFLICT).json({ 
                message: `User with this ${field} already exists` 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const user = new User({ 
            name: name.trim(),
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword 
        });

        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        // Return success response
        return res.status(httpStatus.CREATED).json({ 
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                preferences: user.preferences
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: 'Something went wrong during registration' 
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        return res.status(httpStatus.OK).json({
            user: req.user // Set by auth middleware
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: 'Failed to get user profile' 
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { name, avatar, preferences } = req.body;
        const user = await User.findById(req.user._id);

        if (name) user.name = name.trim();
        if (avatar !== undefined) user.avatar = avatar;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };

        await user.save();

        return res.status(httpStatus.OK).json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: 'Failed to update profile' 
        });
    }
};

// Add meeting to user history
const addMeetingActivity = async (req, res) => {
    try {
        const { meetingId, action, duration } = req.body;
        const user = await User.findById(req.user._id);

        if (action === 'join') {
            user.meetingHistory.push({
                meetingId,
                joinedAt: new Date(),
                duration: duration || 0
            });
        }

        await user.save();

        return res.status(httpStatus.OK).json({
            message: 'Meeting activity recorded',
            meetingHistory: user.meetingHistory
        });
    } catch (error) {
        console.error('Add meeting activity error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: 'Failed to record meeting activity' 
        });
    }
};

// Get user meeting history
const getMeetingHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        return res.status(httpStatus.OK).json({
            meetingHistory: user.meetingHistory
        });
    } catch (error) {
        console.error('Get meeting history error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: 'Failed to get meeting history' 
        });
    }
};

export { 
    login, 
    register, 
    getProfile, 
    updateProfile, 
    addMeetingActivity, 
    getMeetingHistory 
};