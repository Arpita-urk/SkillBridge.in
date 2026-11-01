import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError, asyncH } from '../utils/helpers.js';
export const adminOnly = (req, res, next) => (req.user.role === 'admin' ? next() : next(new ApiError(403, 'Admins only')));
export const protect = asyncH(async (req, res, next) => {
  const token = req.cookies?.sb_token;
  if (!token) throw new ApiError(401, 'Please log in to continue');
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); }
  catch { throw new ApiError(401, 'Your session expired. Log in again'); }
  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'Account not found');
  req.user = user;
  next();
});
