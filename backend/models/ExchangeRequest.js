import mongoose from 'mongoose';
const ref = (m) => ({ type: mongoose.Schema.Types.ObjectId, ref: m, required: true });
const schema = new mongoose.Schema({
  sender: { ...ref('User'), index: true },
  recipient: { ...ref('User'), index: true },
  requestedSkill: ref('Skill'),
  offeredSkill: ref('Skill'),
  message: { type: String, required: true, trim: true, minlength: 5, maxlength: 500 },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' }
}, { timestamps: true });
schema.index({ sender: 1, requestedSkill: 1, offeredSkill: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });
export default mongoose.model('ExchangeRequest', schema);
