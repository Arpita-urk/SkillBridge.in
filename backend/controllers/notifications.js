import Notification from '../models/Notification.js';
import { ApiError, asyncH } from '../utils/helpers.js';
export const list = asyncH(async (req, res) => {
  const data = await Notification.find({ recipient: req.user._id }).sort('-createdAt').limit(50);
  res.json({ success: true, data, unread: data.filter((n) => !n.read).length });
});
export const markRead = asyncH(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { read: true }, { new: true });
  if (!n) throw new ApiError(404, 'Notification not found');
  res.json({ success: true, data: n });
});
export const markAllRead = asyncH(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json({ success: true, message: 'All caught up' });
});
