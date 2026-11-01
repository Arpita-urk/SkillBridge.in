import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeRequest', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 }
}, { timestamps: true });
schema.index({ request: 1, createdAt: 1 });
export default mongoose.model('Message', schema);
