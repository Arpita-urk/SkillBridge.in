import ExchangeRequest from '../models/ExchangeRequest.js';
import Skill from '../models/Skill.js';
import Notification from '../models/Notification.js';
import { ApiError, asyncH } from '../utils/helpers.js';
const populate = (q) => q.populate('sender recipient', 'name avatar').populate('requestedSkill offeredSkill', 'title category level');
export const create = asyncH(async (req, res) => {
  const { requestedSkill, offeredSkill, message } = req.body;
  const wanted = await Skill.findById(requestedSkill);
  if (!wanted) throw new ApiError(404, 'Skill not found');
  if (wanted.owner.equals(req.user._id)) throw new ApiError(400, 'You can not request your own skill');
  const offered = await Skill.findOne({ _id: offeredSkill, owner: req.user._id });
  if (!offered) throw new ApiError(400, 'Pick one of your own skills to offer');
  if (await ExchangeRequest.exists({ sender: req.user._id, requestedSkill, offeredSkill, status: 'pending' }))
    throw new ApiError(409, 'You already have a pending request for this exchange');
  const r = await ExchangeRequest.create({ sender: req.user._id, recipient: wanted.owner, requestedSkill, offeredSkill, message });
  await Notification.create({ recipient: wanted.owner, type: 'request_received', request: r._id, message: `${req.user.name} wants to learn ${wanted.title} and offers ${offered.title}` });
  res.status(201).json({ success: true, data: await populate(ExchangeRequest.findById(r._id)) });
});
export const list = asyncH(async (req, res) => {
  const field = req.query.box === 'sent' ? 'sender' : 'recipient';
  const data = await populate(ExchangeRequest.find({ [field]: req.user._id }).sort('-createdAt'));
  res.json({ success: true, data });
});
export const setStatus = asyncH(async (req, res) => {
  const { status } = req.body;
  const r = await populate(ExchangeRequest.findById(req.params.id));
  if (!r) throw new ApiError(404, 'Request not found');
  const me = req.user._id;
  if (['accepted', 'rejected'].includes(status)) {
    if (!r.recipient._id.equals(me)) throw new ApiError(403, 'Only the recipient can accept or reject');
  } else if (status === 'cancelled') {
    if (!r.sender._id.equals(me)) throw new ApiError(403, 'Only the sender can cancel');
  } else throw new ApiError(400, 'Invalid status');
  if (r.status !== 'pending') throw new ApiError(409, `This request is already ${r.status}`);
  r.status = status;
  await r.save();
  const toSender = status !== 'cancelled';
  await Notification.create({
    recipient: toSender ? r.sender._id : r.recipient._id, type: `request_${status}`, request: r._id,
    message: toSender ? `${r.recipient.name} ${status} your request for ${r.requestedSkill.title}` : `${r.sender.name} cancelled their request for ${r.requestedSkill.title}`
  });
  res.json({ success: true, data: r });
});
