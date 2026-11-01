import ExchangeRequest from '../models/ExchangeRequest.js';
import Message from '../models/Message.js';
import Rating from '../models/Rating.js';
import Notification from '../models/Notification.js';
import { ApiError, asyncH } from '../utils/helpers.js';
async function chatRequest(req) {
  const r = await ExchangeRequest.findById(req.params.id)
    .populate('sender recipient', 'name avatar').populate('requestedSkill offeredSkill', 'title category level');
  if (!r) throw new ApiError(404, 'Exchange not found');
  const me = req.user._id;
  if (!r.sender._id.equals(me) && !r.recipient._id.equals(me)) throw new ApiError(403, 'This chat is private');
  if (r.status !== 'accepted') throw new ApiError(409, 'Chat opens once the request is accepted');
  return r;
}
export const list = asyncH(async (req, res) => {
  const request = await chatRequest(req);
  const messages = await Message.find({ request: request._id }).sort('createdAt _id').limit(300);
  const myRating = await Rating.findOne({ request: request._id, rater: req.user._id });
  res.json({ success: true, data: { request, messages, myRating } });
});
export const send = asyncH(async (req, res) => {
  const request = await chatRequest(req);
  const text = String(req.body.text || '').trim();
  if (!text) throw new ApiError(400, 'Write a message first');
  if (text.length > 1000) throw new ApiError(400, 'Keep messages under 1000 characters');
  const message = await Message.create({ request: request._id, sender: req.user._id, text });
  const other = request.sender._id.equals(req.user._id) ? request.recipient._id : request.sender._id;

  const pending = await Notification.exists({ recipient: other, request: request._id, type: 'new_message', read: false });
  if (!pending) await Notification.create({ recipient: other, type: 'new_message', request: request._id, message: `${req.user.name} sent you a message about ${request.requestedSkill.title}` });
  res.status(201).json({ success: true, data: message });
});
