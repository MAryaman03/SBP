import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Notification from '../models/Notification';
import { IAuthRequest, IAuthResponse, IJWTPayload } from '../types/index';
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
  sendSuccess,
  handleAsync,
} from '../utils/errors';
import { config } from '../config/index';

const generateAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.REFRESH_TOKEN_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRE,
  });
};

// ─── SIGN UP ──────────────────────────────────────────────────────────────────
export const signUp = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password) {
      throw new ValidationError('Name, email, and password are required');
    }

    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id as string);
    const refreshToken = generateRefreshToken(user._id as string);

    // Save refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Create welcome notification
    await Notification.create({
      userId: user._id,
      title: 'Welcome to Snigdha Beauty Parlour',
      message: 'Your account has been created successfully. Start booking your first appointment!',
      type: 'booking',
    });

    const response: IAuthResponse = {
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };

    sendSuccess(res, response, 'Account created successfully', 201);
  }
);

// ─── SIGN IN ──────────────────────────────────────────────────────────────────
export const signIn = handleAsync(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  // Find user with password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id as string);
  const refreshToken = generateRefreshToken(user._id as string);

  // Save refresh token and update lastLogin
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  const response: IAuthResponse = {
    success: true,
    token: accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
    },
  };

  sendSuccess(res, response, `Welcome back, ${user.name.split(' ')[0]}!`);
});

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
export const refreshAccessToken = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify refresh token
    let decoded: IJWTPayload;
    try {
      decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET) as IJWTPayload;
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Get user
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      throw new AuthenticationError('Refresh token is invalid');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id as string);
    const newRefreshToken = generateRefreshToken(user._id as string);

    user.refreshToken = newRefreshToken;
    await user.save();

    const response: IAuthResponse = {
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    sendSuccess(res, response, 'Token refreshed');
  }
);

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
export const getCurrentUser = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    sendSuccess(res, user, 'User retrieved');
  }
);

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
export const updateProfile = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { name, phone, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(profileImage && { profileImage }),
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    sendSuccess(res, user, 'Profile updated successfully');
  }
);

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = handleAsync(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  // Clear refresh token
  await User.findByIdAndUpdate(req.user?._id, { refreshToken: null });

  sendSuccess(res, {}, 'Logged out successfully');
});

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
export const changePassword = handleAsync(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      throw new ValidationError('All fields are required');
    }

    if (newPassword !== confirmPassword) {
      throw new ValidationError('New passwords do not match');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters');
    }

    const user = await User.findById(req.user?._id).select('+password');
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    sendSuccess(res, {}, 'Password changed successfully');
  }
);
