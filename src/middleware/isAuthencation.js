import jwt from 'jsonwebtoken';
import { catchAsyncError } from '../models/catchAsyncError.js';
import ErrorHandler from './errorMiddleware.js';
import { User } from '../models/usermodel.js';

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new ErrorHandler("You are not logged in. Please login to access.", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new ErrorHandler("The user belonging to this token does not exist.", 401));
  }

  req.user = currentUser;
  next();
});
