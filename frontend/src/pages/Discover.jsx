import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SearchX, Repeat2, Star } from 'lucide-react';
import api, { errMsg } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Select, Skeletons, Empty, LevelBadge, Tag, Modal, Field, Avatar, CATEGORIES, LEVELS } from '../components/ui.jsx';
function RequestModal({ skill, onClose }) {
  const { notify } = useAuth();
  const [mine, setMine] = useState(null);
  const [offered, setOffered] = useState('');
  const [message, setMessage] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get('/skills', { params: { mine: true } }).then((r) => { setMine(r.data.data); setOffered(r.data.data[0]?._id || ''); }); }, []);
  const send = async (e) => {
    e.preventDefault();
    if (message.trim().length < 5) return setErr('Write a short intro (at least 5 characters)');
    setBusy(true);
    try { await api.post('/requests', { requestedSkill: skill._id, offeredSkill: offered, message }); notify('Request sent!'); onClose(); }
    catch (e2) { setErr(errMsg(e2)); } finally { setBusy(false); }
  };
  return (
    <Modal title={`Learn ${skill.title}`} onClose={onClose}>
      {mine && !mine.length ? (
        <div className="text-sm"><p className="text-soft">You need to share a skill first so you have something to offer in return.</p><div className="mt-4"><Button to="/app/my-skills">Share a skill</Button></div></div>
      ) : (
        <form onSubmit={send} className="space-y-4">
          {err && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{err}</p>}
          <Field label="Your skill to offer" as="select" name="offered" value={offered} onChange={(e) => setOffered(e.target.value)}>{mine?.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}</Field>
          <Field label={`Intro for ${skill.owner.name}`} as="textarea" rows={4} name="message" maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hey! I'd love to learn this and can help with…" />
          <Button type="submit" loading={busy} disabled={!mine} className="w-full"><Repeat2 className="size-4" />Send request</Button>
        </form>)}
    </Modal>);
}
export default function Discover() {
  const { user } = useAuth();
  const [q, setQ] = useState({ search: '', category: '', level: '' });
  const [skills, setSkills] = useState(null);
  const [stats, setStats] = useState(null);
  const [target, setTarget] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/users/stats').then((r) => setStats(r.data.data)).catch(() => {}); }, []);
  useEffect(() => {
    setSkills(null);
    const t = setTimeout(() => api.get('/skills', { params: q }).then((r) => { setSkills(r.data.data); setError(''); }).catch((e) => setError(errMsg(e))), 250);
    return () => clearTimeout(t);
  }, [q]);
  const set = (k) => (e) => setQ({ ...q, [k]: e.target.value });
  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl font-extrabold">Hey {user.name.split(' ')[0]}, what do you want to learn?</h1>
        {stats && <p className="mt-1 text-sm text-soft">{stats.mySkills} skills shared · {stats.incoming} requests waiting for you · {stats.accepted} accepted swaps</p>}</div>
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-52 flex-1"><Search className="absolute left-3.5 top-3 size-4 text-soft" /><input aria-label="Search skills" value={q.search} onChange={set('search')} placeholder="Search by title" className="w-full rounded-xl border border-lav bg-white py-2.5 pl-10 pr-4 text-sm" /></div>
        <Select aria-label="Category" value={q.category} onChange={set('category')}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
        <Select aria-label="Level" value={q.level} onChange={set('level')}><option value="">All levels</option>{LEVELS.map((c) => <option key={c}>{c}</option>)}</Select>
      </div>
      {error ? <p role="alert" className="text-rose-700">{error}</p> : !skills ? <Skeletons /> : !skills.length ? (
        <Empty icon={SearchX} title="No skills match" text="Try a different search, or be the first to share one." action={<Button to="/app/my-skills">Share a skill</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{skills.map((s) => (
          <article key={s._id} className="flex flex-col rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex flex-wrap gap-2"><Tag>{s.category}</Tag><LevelBadge level={s.level} /></div>
            <h3 className="font-display mt-3 text-xl font-bold">{s.title}</h3>
            <p className="mt-1 line-clamp-3 flex-1 text-sm text-soft">{s.description}</p>
            <div className="mt-4 flex items-center justify-between gap-2">
              <Link to={s.owner._id === user.id ? '/app/profile' : `/app/u/${s.owner._id}`} className="flex min-w-0 items-center gap-2 text-sm font-semibold"><Avatar user={s.owner} size={28} /><span className="truncate">{s.owner.name}</span>{s.ownerRating && <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-soft"><Star className="size-3 fill-amber-400 text-amber-400" />{s.ownerRating.avg.toFixed(1)} ({s.ownerRating.count})</span>}</Link>
              {s.owner._id === user.id ? <span className="text-xs text-soft">Yours</span> : <Button className="!px-4 !py-2" onClick={() => setTarget(s)}>Request swap</Button>}
            </div></article>))}</div>)}
      {target && <RequestModal skill={target} onClose={() => setTarget(null)} />}
    </div>);
}
