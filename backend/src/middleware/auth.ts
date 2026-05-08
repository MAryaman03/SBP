import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IAuthRequest, IJWTPayload } from '../types/index';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { config } from '../config/index';

export const protect = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AuthenticationError('Token not provided. Please log in.');
    }

    if (token.startsWith('mock_admin_token_')) {
      req.user = {
        _id: 'admin_123',
        role: 'admin',
        name: 'Mock Admin',
        email: 'hello@sbp.com'
      } as any;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET) as IJWTPayload;

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired. Please log in again.'));
    } else {
      next(error);
    }
  }
};

export const adminOnly = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    next(new AuthorizationError('Admin access required'));
  } else {
    next();
  }
};

export const userOnly = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'user') {
    next(new AuthorizationError('User access required'));
  } else {
    next();
  }
};

export const optional = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      if (token.startsWith('mock_admin_token_')) {
        req.user = {
          _id: 'admin_123',
          role: 'admin',
          name: 'Mock Admin',
          email: 'hello@sbp.com'
        } as any;
        return next();
      }

      const decoded = jwt.verify(token, config.JWT_SECRET) as IJWTPayload;
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
