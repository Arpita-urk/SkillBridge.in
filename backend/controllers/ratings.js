import ExchangeRequest from '../models/ExchangeRequest.js';
import Rating from '../models/Rating.js';
import Notification from '../models/Notification.js';
import { ApiError, asyncH } from '../utils/helpers.js';
export const create = asyncH(async (req, res) => {
  const r = await ExchangeRequest.findById(req.params.id).populate('sender recipient', 'name').populate('requestedSkill offeredSkill', 'title');
  if (!r) throw new ApiError(404, 'Exchange not found');
  const isSender = r.sender._id.equals(req.user._id);
  if (!isSender && !r.recipient._id.equals(req.user._id)) throw new ApiError(403, 'Only people in this exchange can rate it');
  if (r.status !== 'accepted') throw new ApiError(409, 'You can rate once the exchange is accepted');
  const stars = Number(req.body.stars);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new ApiError(400, 'Pick 1 to 5 stars');
  if (await Rating.exists({ request: r._id, rater: req.user._id })) throw new ApiError(409, 'You already rated this exchange');
  const teacher = isSender ? r.recipient : r.sender, skill = isSender ? r.requestedSkill : r.offeredSkill;
  const rating = await Rating.create({ request: r._id, rater: req.user._id, teacher: teacher._id, skill: skill?._id, skillTitle: skill?.title || '', stars, comment: String(req.body.comment || '').trim().slice(0, 300) });
  await Notification.create({ recipient: teacher._id, type: 'new_rating', request: r._id, message: `${req.user.name} rated your ${skill?.title || 'teaching'} ${stars} star${stars > 1 ? 's' : ''}` });
  res.status(201).json({ success: true, data: rating });
});
