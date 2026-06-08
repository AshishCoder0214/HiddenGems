import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { logger } from '../config/logger.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// Register User
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    logger.info('New user registered successfully', { userId: user._id });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      savedPlaces: user.savedPlaces || [],
      explorerLevel: user.explorerLevel,
      contributionsCount: user.contributionsCount,
      badges: user.badges,
      token: generateToken(user._id)
    });
  } catch (err) {
    next(err);
  }
};

// Login User
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      logger.info('User logged in successfully', { userId: user._id });
      
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        savedPlaces: user.savedPlaces,
        explorerLevel: user.explorerLevel,
        contributionsCount: user.contributionsCount,
        badges: user.badges,
        token: generateToken(user._id)
      });
    }

    return res.status(401).json({ error: 'Invalid email or password' });
  } catch (err) {
    next(err);
  }
};

// Get User Profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPlaces',
      match: { deletedAt: null }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      savedPlaces: user.savedPlaces,
      explorerLevel: user.explorerLevel,
      contributionsCount: user.contributionsCount,
      badges: user.badges
    });
  } catch (err) {
    next(err);
  }
};
