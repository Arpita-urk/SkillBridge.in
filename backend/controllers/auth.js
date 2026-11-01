import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError, asyncH } from '../utils/helpers.js';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cookieOpts = () => ({ httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 864e5 });
export const pub = (u) => ({ id: u._id, name: u.name, email: u.email, bio: u.bio, avatar: u.avatar, wantToLearn: u.wantToLearn, role: u.role, createdAt: u.createdAt });
const send = (res, user, status = 200) => {
  res.cookie('sb_token', jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }), cookieOpts());
  res.status(status).json({ success: true, data: pub(user) });
};
export const register = asyncH(async (req, res) => {
  const { name = '', email = '', password = '', confirmPassword = '' } = req.body;
  if (name.trim().length < 2) throw new ApiError(400, 'Name must be at least 2 characters');
  if (!EMAIL.test(email)) throw new ApiError(400, 'Enter a valid email');
  if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');
  if (password !== confirmPassword) throw new ApiError(400, 'Passwords do not match');
  if (await User.findOne({ email: email.toLowerCase() })) throw new ApiError(409, 'That email is already registered');
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), lastLoginAt: new Date(), loginCount: 1 });
  send(res, user, 201);
});
export const login = asyncH(async (req, res) => {
  const { email = '', password = '' } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) throw new ApiError(401, 'Wrong email or password');
  user.lastLoginAt = new Date(); user.loginCount = (user.loginCount || 0) + 1; await user.save();
  send(res, user);
});
export const logout = (req, res) => { res.clearCookie('sb_token', cookieOpts()); res.json({ success: true, message: 'Logged out' }); };
export const me = (req, res) => res.json({ success: true, data: pub(req.user) });
