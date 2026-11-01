import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Skill from './models/Skill.js';
import ExchangeRequest from './models/ExchangeRequest.js';
import Notification from './models/Notification.js';
import Message from './models/Message.js';
import Rating from './models/Rating.js';

const [, , argName, argEmail, argPass] = process.argv;
const ME = {
  name: argName || process.env.SEED_NAME || 'Demo Student',
  email: (argEmail || process.env.SEED_EMAIL || 'demo@demo.skillbridge.dev').toLowerCase(),
  password: argPass || process.env.SEED_PASSWORD || 'demo1234'
};
const DOMAIN = '@demo.skillbridge.dev';
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const levelText = {
  Beginner: 'Start from zero with simple exercises and friendly explanations.',
  Intermediate: 'Build on the basics with real mini projects and feedback.',
  Advanced: 'Go deep: tricky edge cases, best practices and code or work reviews.'
};
const CATALOG = {
  Development: ['React', 'Node.js APIs', 'Python', 'JavaScript', 'Git & GitHub', 'HTML & CSS', 'Java', 'Flutter apps'],
  Design: ['UI/UX design', 'Figma', 'Photoshop', 'Illustrator', 'Brand identity', 'Canva', 'Motion graphics', 'Video editing'],
  Data: ['Python for data analysis', 'SQL', 'Excel', 'Power BI', 'Machine learning', 'Statistics', 'Data visualization', 'Google Sheets'],
  Marketing: ['Instagram growth', 'SEO', 'Content marketing', 'Email marketing', 'Google Ads', 'Personal branding', 'Influencer outreach', 'Marketing analytics'],
  Languages: ['Spanish', 'French', 'Japanese', 'German', 'Hindi', 'English speaking', 'Korean', 'Mandarin'],
  Music: ['Guitar', 'Piano', 'Music production', 'Singing', 'Drums', 'Songwriting', 'DJing', 'Music theory'],
  Writing: ['Copywriting', 'Creative writing', 'Technical writing', 'Blogging', 'Resume writing', 'Poetry', 'Screenwriting', 'Academic writing'],
  Business: ['Public speaking', 'Startup pitching', 'Product management', 'Personal finance', 'Negotiation', 'Leadership', 'Project management', 'Entrepreneurship'],
  Other: ['Photography', 'Cooking', 'Chess', 'Fitness coaching', 'Study techniques', 'Time management', 'Drawing', 'Yoga']
};
const NAMES = ['Aarav Mehta', 'Sara Khan', 'Diego Alvarez', 'Priya Nair', 'Marcus Lee', 'Ananya Rao', 'Kenji Tanaka', 'Fatima Zahra', 'Liam Oconnor', 'Zoya Ahmed',
  'Rohan Das', 'Mia Chen', 'Noah Williams', 'Isha Kapoor', 'Lucas Silva', 'Aisha Rahman', 'Ethan Brown', 'Sofia Rossi', 'Arjun Reddy', 'Hana Kim',
  'Omar Farouk', 'Chloe Martin', 'Vikram Singh', 'Emma Johansson', 'Yusuf Demir', 'Naina Joshi', 'Tom Becker', 'Leila Haddad', 'Karan Malhotra', 'Grace Okafor'];
const BIOS = ['Coffee-powered and always learning.', 'Third year, side-project addict.', 'Here to swap skills and make friends.', 'Teaching is the best way to learn.',
  'Night owl. Ask me anything.', 'Part-time freelancer, full-time curious.', 'Club organizer who loves helping beginners.', 'Learning in public.'];
const MSGS = [(w, o) => `Hey! I really want to learn ${w}. I can teach you ${o} in return.`, (w, o) => `Your ${w} skills are exactly what I need. Would you swap for ${o}?`,
  (w, o) => `Hi! Been trying to pick up ${w} for ages. Happy to help you with ${o}.`, (w, o) => `Would love a ${w} session. I can offer ${o} lessons. Deal?`,
  (w, o) => `Hello! ${w} for ${o}, weekends work for me. Interested?`];
const MINE = [['React & Vite projects', 'Development', 'Intermediate'], ['Python basics', 'Development', 'Beginner'], ['Advanced JavaScript patterns', 'Development', 'Advanced'],
  ['Figma prototyping', 'Design', 'Beginner'], ['UI design critique', 'Design', 'Advanced'], ['SQL for beginners', 'Data', 'Beginner'], ['Data storytelling', 'Data', 'Intermediate'],
  ['Instagram content planning', 'Marketing', 'Beginner'], ['Conversational Hindi', 'Languages', 'Beginner'], ['Guitar chords & strumming', 'Music', 'Beginner'],
  ['Blog writing', 'Writing', 'Intermediate'], ['Public speaking', 'Business', 'Intermediate'], ['Pitch deck feedback', 'Business', 'Advanced'],
  ['Photography basics', 'Other', 'Beginner'], ['Chess openings', 'Other', 'Intermediate']];
const av = (n) => `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(n)}&backgroundColor=e4dcff`;
const ago = (h) => new Date(Date.now() - h * 36e5);

await mongoose.connect(process.env.MONGODB_URI);

const demoUsers = await User.find({ email: new RegExp(`${DOMAIN.replace('.', '\\.')}$`) }).select('_id');
let me = await User.findOne({ email: ME.email });
const wipe = [...demoUsers.map((u) => u._id), ...(me ? [me._id] : [])];
const oldReqs = await ExchangeRequest.find({ $or: [{ sender: { $in: wipe } }, { recipient: { $in: wipe } }] }).select('_id');
await Message.deleteMany({ request: { $in: oldReqs.map((x) => x._id) } });
await Rating.deleteMany({ request: { $in: oldReqs.map((x) => x._id) } });
await Promise.all([Notification.deleteMany({ recipient: { $in: wipe } }), ExchangeRequest.deleteMany({ $or: [{ sender: { $in: wipe } }, { recipient: { $in: wipe } }] }),
  Skill.deleteMany({ owner: { $in: wipe } })]);
await User.deleteMany({ _id: { $in: demoUsers.map((u) => u._id) }, email: { $ne: ME.email } });
const hash = await bcrypt.hash(ME.password, 12);
const demoHash = await bcrypt.hash('demo1234', 12);
const allTopics = Object.values(CATALOG).flat();
const pickLearn = (i) => [0, 1, 2].map((k) => allTopics[(i * 7 + k * 23) % allTopics.length]);
const meData = { role: 'admin', name: ME.name, password: hash, bio: 'Student who loves swapping skills. Ask me about React, design or chess!', avatar: av(ME.name), wantToLearn: ['Spanish', 'Guitar', 'Machine learning', 'Photography'] };
if (me) { Object.assign(me, meData); await me.save(); } else me = await User.create({ email: ME.email, ...meData });

const users = [];
for (const [i, name] of NAMES.entries()) users.push(await User.create({ name, email: `${name.split(' ')[0].toLowerCase()}${DOMAIN}`, password: demoHash, bio: BIOS[i % BIOS.length], avatar: av(name), wantToLearn: pickLearn(i), lastLoginAt: ago(Math.floor(Math.random() * 240)), loginCount: 1 + Math.floor(Math.random() * 30), createdAt: ago(24 * (60 - i)) }));

// ---- skills: every topic is taught by 3 different students at 3 different levels ----
const byUser = new Map(users.map((u) => [String(u._id), []]));
const byTopic = {};
let g = 0;
const docs = [];
for (const [category, topics] of Object.entries(CATALOG)) for (const topic of topics) {
  for (let v = 0; v < 3; v++) {
    const owner = users[(g * 3 + v) % users.length], level = LEVELS[(g + v) % 3];
    docs.push({ title: v === 0 ? topic : v === 1 ? `${topic} made simple` : `${topic} deep dive`, description: `Learn ${topic}. ${levelText[level]}`, category, level, owner: owner._id, createdAt: ago(5 + ((g * 3 + v) % 300)) });
  }
  g++;
}
const created = await Skill.insertMany(docs);
for (const s of created) byUser.get(String(s.owner)).push(s);
const mySkills = [];
for (const [i, [title, category, level]] of MINE.entries()) mySkills.push(await Skill.create({ title, category, level, owner: me._id, description: `${levelText[level]} Hands-on and beginner friendly: ${title}.`, createdAt: ago(40 + i * 9) }));

let n = 0;
async function request(sender, wanted, offered, status, hoursAgo, { unread } = {}) {
  const wantedOwner = wanted.owner, k = n++;
  const [sName, rName] = [sender.name, String((await User.findById(wantedOwner).select('name')).name)];
  const r = await ExchangeRequest.create({ sender: sender._id, recipient: wantedOwner, requestedSkill: wanted._id, offeredSkill: offered._id, message: MSGS[k % MSGS.length](wanted.title, offered.title), status, createdAt: ago(hoursAgo) });
  const mk = (recipient, type, message, read, h) => Notification.create({ recipient, type, message, request: r._id, read, createdAt: ago(h) });
  await mk(wantedOwner, 'request_received', `${sName} wants to learn ${wanted.title} and offers ${offered.title}`, unread === undefined ? status !== 'pending' : !unread, hoursAgo);
  if (status === 'accepted' || status === 'rejected') await mk(sender._id, `request_${status}`, `${rName} ${status} your request for ${wanted.title}`, unread === undefined ? true : !unread, Math.max(hoursAgo - 3, 1));
  if (status === 'accepted') {
    const f = rName.split(' ')[0];
    const lines = [[sender._id, `Hi ${f}! Thanks for accepting. When are you free this week?`], [wantedOwner, `Hey! Thursday evening works. I will share a Meet link.`],
      [sender._id, `Perfect. I will bring questions about ${wanted.title}.`], [wantedOwner, `Great! Start with this guide: https://developer.mozilla.org then we swap ${offered.title} next.`]];
    for (const [i, [from, text]] of lines.entries()) await Message.create({ request: r._id, sender: from, text, createdAt: ago(Math.max(hoursAgo - 4 - i, 0.1)) });
    const stars = [5, 4, 5, 3, 4, 5, 5, 4][k % 8], notes = ['Super clear and patient!', 'Great session, learned a lot.', 'Very helpful, would swap again.', 'Good, a bit fast at times.', ''];
    await Rating.create({ request: r._id, rater: sender._id, teacher: wantedOwner, skill: wanted._id, skillTitle: wanted.title, stars, comment: notes[k % 5], createdAt: ago(Math.max(hoursAgo - 6, 0.1)) });
    if (k % 2 === 0) await Rating.create({ request: r._id, rater: wantedOwner, teacher: sender._id, skill: offered._id, skillTitle: offered.title, stars: [4, 5, 5, 4][k % 4], comment: notes[(k + 2) % 5], createdAt: ago(Math.max(hoursAgo - 7, 0.1)) });
  }
  if (status === 'cancelled') await mk(wantedOwner, 'request_cancelled', `${sName} cancelled their request for ${wanted.title}`, unread === undefined ? true : !unread, Math.max(hoursAgo - 2, 1));
}
const first = (u) => byUser.get(String(u._id))[0];
const inStatus = ['pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'accepted', 'accepted', 'accepted', 'rejected', 'rejected', 'cancelled', 'cancelled'];
for (const [i, st] of inStatus.entries()) await request(users[i], mySkills[(i * 2) % mySkills.length], first(users[i]), st, 3 + i * 7, { unread: st === 'pending' || i % 3 === 0 });
const sentStatus = ['pending', 'pending', 'pending', 'pending', 'pending', 'accepted', 'accepted', 'accepted', 'rejected', 'cancelled'];
for (const [i, st] of sentStatus.entries()) { const t = users[16 + i]; await request(me, byUser.get(String(t._id))[(i + 1) % byUser.get(String(t._id)).length], mySkills[(i * 3 + 1) % mySkills.length], st, 10 + i * 11, { unread: st !== 'pending' && i % 2 === 0 }); }
const st3 = ['pending', 'accepted', 'rejected', 'pending', 'cancelled'];
for (let i = 0; i < 25; i++) { const a = users[i % 15], b = users[15 + ((i * 4 + 3) % 15)]; await request(a, first(b), byUser.get(String(a._id))[i < 15 ? 0 : 1], st3[i % 5], 20 + i * 5); }

const total = await Skill.countDocuments({ owner: { $in: [...users.map((u) => u._id), me._id] } });
console.log(`Seeded ${users.length} students, ${total} skills (${MINE.length} on your profile), ${n} requests.`);
console.log(`Log in as ${ME.email} / ${ME.password}`);
console.log(`Other students: <firstname>${DOMAIN} / demo1234  e.g. sara${DOMAIN}`);
await mongoose.disconnect();
