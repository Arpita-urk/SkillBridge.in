import mongoose from 'mongoose';
const id = (ref) => ({ type: mongoose.Schema.Types.ObjectId, ref, required: true });
const schema = new mongoose.Schema({
  request: id('ExchangeRequest'), rater: id('User'), teacher: { ...id('User'), index: true }, skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
  skillTitle: { type: String, default: '' },
  stars: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '', maxlength: 300 }
}, { timestamps: true });
schema.index({ request: 1, rater: 1 }, { unique: true }); // one rating per person per exchange
export default mongoose.model('Rating', schema);
