import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';
if (!process.env.JWT_SECRET) { console.error('JWT_SECRET is not set'); process.exit(1); }
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());
app.use('/api', routes);
// In production (or after `npm run build` in frontend) one server serves both the API and the website
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist, { setHeaders: (res, file) => { if (file.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache'); } }));
  // never answer a missing /assets file with index.html (that breaks CSS and JS)
  app.get(/^(?!\/api|\/assets\/).*/, (req, res) => { res.setHeader('Cache-Control', 'no-cache'); res.sendFile(path.join(dist, 'index.html')); });
}
app.use(notFound);
app.use(errorHandler);
const port = process.env.PORT || 5000;
connectDB().then(() => app.listen(port, () => console.log(`API on :${port}`))).catch((e) => { console.error(e.message); process.exit(1); });
