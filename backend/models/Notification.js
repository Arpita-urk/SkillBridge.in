import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['request_received', 'request_accepted', 'request_rejected', 'request_cancelled', 'new_message', 'new_rating'], required: true },
  message: { type: String, required: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeRequest' },
  read: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Notification', schema);
