import User from '../models/User.js';
import Skill from '../models/Skill.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import Message from '../models/Message.js';
import Rating from '../models/Rating.js';
import { asyncH } from '../utils/helpers.js';
export const overview = asyncH(async (req, res) => {
  const day = new Date(Date.now() - 864e5);
  const [users, skills, requests, messages, ratingAgg, active, byStatus, byCategory, userList, skillCounts, recentSkills, recentRequests, top] = await Promise.all([
    User.countDocuments(), Skill.countDocuments(), ExchangeRequest.countDocuments(), Message.countDocuments(),
    Rating.aggregate([{ $group: { _id: null, avg: { $avg: '$stars' }, count: { $sum: 1 } } }]),
    User.countDocuments({ lastLoginAt: { $gte: day } }),
    ExchangeRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Skill.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    User.find().sort('-lastLoginAt').limit(100).select('name email role createdAt lastLoginAt loginCount'),
    Skill.aggregate([{ $group: { _id: '$owner', count: { $sum: 1 } } }]),
    Skill.find().populate('owner', 'name').sort('-createdAt').limit(15),
    ExchangeRequest.find().populate('sender recipient', 'name').populate('requestedSkill offeredSkill', 'title').sort('-createdAt').limit(15),
    Rating.aggregate([{ $group: { _id: '$teacher', avg: { $avg: '$stars' }, count: { $sum: 1 } } }, { $match: { count: { $gte: 2 } } }, { $sort: { avg: -1, count: -1 } }, { $limit: 5 }])
  ]);
  const sc = new Map(skillCounts.map((x) => [String(x._id), x.count]));
  const names = new Map((await User.find({ _id: { $in: top.map((t) => t._id) } }).select('name')).map((u) => [String(u._id), u.name]));
  res.json({ success: true, data: {
    counts: { users, skills, requests, messages, ratings: ratingAgg[0]?.count || 0, avgRating: ratingAgg[0]?.avg || 0, active24h: active },
    requestsByStatus: Object.fromEntries(byStatus.map((x) => [x._id, x.count])),
    skillsByCategory: byCategory.map((x) => ({ category: x._id, count: x.count })),
    users: userList.map((u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt, loginCount: u.loginCount, skillCount: sc.get(String(u._id)) || 0 })),
    skills: recentSkills, requests: recentRequests,
    topTeachers: top.map((t) => ({ id: t._id, name: names.get(String(t._id)) || 'Unknown', avg: t.avg, count: t.count }))
  } });
});
