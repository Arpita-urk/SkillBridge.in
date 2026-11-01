// Usage: node make-admin.js you@email.com   (gives that account the Admin dashboard)
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
const email = (process.argv[2] || '').toLowerCase();
if (!email) { console.log('Usage: node make-admin.js you@email.com'); process.exit(1); }
await mongoose.connect(process.env.MONGODB_URI);
const u = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
console.log(u ? `${u.name} is now an admin` : 'No user found with that email');
await mongoose.disconnect();
