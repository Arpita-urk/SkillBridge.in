import mongoose from 'mongoose';
import Rating from '../models/Rating.js';
import Skill from '../models/Skill.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import { ApiError, asyncH, escapeRegex, CATEGORIES, LEVELS } from '../utils/helpers.js';
const clean = ({ title, description, category, level }) => ({ title, description, category, level });
export const list = asyncH(async (req, res) => {
  const { search, category, level, mine } = req.query;
  const q = {};
  if (mine === 'true') q.owner = req.user._id;
  if (search) q.title = { $regex: escapeRegex(String(search).slice(0, 60)), $options: 'i' };
  if (CATEGORIES.includes(category)) q.category = category;
  if (LEVELS.includes(level)) q.level = level;
  const skills = await Skill.find(q).populate('owner', 'name avatar').sort('-createdAt').limit(100);
  const owners = [...new Set(skills.filter((s) => s.owner).map((s) => String(s.owner._id)))].map((i) => new mongoose.Types.ObjectId(i));
  const agg = await Rating.aggregate([{ $match: { teacher: { $in: owners } } }, { $group: { _id: '$teacher', avg: { $avg: '$stars' }, count: { $sum: 1 } } }]);
  const m = new Map(agg.map((a) => [String(a._id), { avg: a.avg, count: a.count }]));
  res.json({ success: true, data: skills.filter((s) => s.owner).map((s) => ({ ...s.toObject(), ownerRating: m.get(String(s.owner._id)) || null })) });
});
export const create = asyncH(async (req, res) => {
  const skill = await Skill.create({ ...clean(req.body), owner: req.user._id });
  res.status(201).json({ success: true, data: await skill.populate('owner', 'name avatar') });
});
async function owned(req) {
  const s = await Skill.findById(req.params.id);
  if (!s) throw new ApiError(404, 'Skill not found');
  if (!s.owner.equals(req.user._id)) throw new ApiError(403, 'You can only change your own skills');
  return s;
}
export const update = asyncH(async (req, res) => {
  const s = await owned(req);
  Object.assign(s, clean(req.body));
  await s.save();
  res.json({ success: true, data: await s.populate('owner', 'name avatar') });
});
export const remove = asyncH(async (req, res) => {
  const s = await owned(req);
  const busy = await ExchangeRequest.exists({ status: 'pending', $or: [{ requestedSkill: s._id }, { offeredSkill: s._id }] });
  if (busy) throw new ApiError(409, 'This skill has pending requests. Resolve them first');
  await s.deleteOne();
  res.json({ success: true, message: 'Skill deleted' });
});
