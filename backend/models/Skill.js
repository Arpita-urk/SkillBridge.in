import mongoose from 'mongoose';
import { CATEGORIES, LEVELS } from '../utils/helpers.js';
const skillSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 80 },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 600 },
  category: { type: String, required: true, enum: CATEGORIES },
  level: { type: String, required: true, enum: LEVELS },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });
skillSchema.index({ title: 1 });
export default mongoose.model('Skill', skillSchema);
