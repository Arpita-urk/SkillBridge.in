import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  bio: { type: String, default: '', maxlength: 300 },
  avatar: { type: String, default: '' },
  wantToLearn: { type: [String], default: [] },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  lastLoginAt: { type: Date, default: null },
  loginCount: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model('User', userSchema);
