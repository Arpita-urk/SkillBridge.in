import User from '../models/User.js';
import Skill from '../models/Skill.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import Rating from '../models/Rating.js';
import Notification from '../models/Notification.js';
import { ApiError, asyncH } from '../utils/helpers.js';
import { pub } from './auth.js';
export const getProfile = asyncH(async (req, res) => {
  const u = await User.findById(req.params.id).select('name bio avatar wantToLearn createdAt');
  if (!u) throw new ApiError(404, 'Student not found');
  const skills = await Skill.find({ owner: u._id }).sort('-createdAt');
  const [agg] = await Rating.aggregate([{ $match: { teacher: u._id } }, { $group: { _id: null, avg: { $avg: '$stars' }, count: { $sum: 1 } } }]);
  const reviews = await Rating.find({ teacher: u._id }).sort('-createdAt').limit(10).populate('rater', 'name avatar');
  res.json({ success: true, data: { id: u._id, name: u.name, bio: u.bio, avatar: u.avatar, wantToLearn: u.wantToLearn, createdAt: u.createdAt, skills, rating: { avg: agg?.avg || 0, count: agg?.count || 0, reviews } } });
});
export const updateMe = asyncH(async (req, res) => {
  const { name, bio, avatar, wantToLearn } = req.body;
  if (name !== undefined) req.user.name = name;
  if (bio !== undefined) req.user.bio = bio;
  if (avatar !== undefined) {
    if (avatar && !/^https:\/\/\S+$/.test(avatar)) throw new ApiError(400, 'Avatar must be an https image link');
    req.user.avatar = avatar;
  }
  if (Array.isArray(wantToLearn)) req.user.wantToLearn = [...new Set(wantToLearn.map((s) => String(s).trim()).filter(Boolean))].slice(0, 15);
  await req.user.save();
  res.json({ success: true, data: pub(req.user) });
});
export const stats = asyncH(async (req, res) => {
  const id = req.user._id;
  const [mySkills, incoming, sent, accepted, unread] = await Promise.all([
    Skill.countDocuments({ owner: id }),
    ExchangeRequest.countDocuments({ recipient: id, status: 'pending' }),
    ExchangeRequest.countDocuments({ sender: id, status: 'pending' }),
    ExchangeRequest.countDocuments({ status: 'accepted', $or: [{ sender: id }, { recipient: id }] }),
    Notification.countDocuments({ recipient: id, read: false })
  ]);
  res.json({ success: true, data: { mySkills, incoming, sent, accepted, unread } });
});
