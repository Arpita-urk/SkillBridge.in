import { useEffect, useState } from 'react';
import { Users, Sparkles, Repeat2, MessageSquare, Star, Activity } from 'lucide-react';
import api, { errMsg } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Skeletons, Stars, StatusBadge, Tag, LevelBadge } from '../components/ui.jsx';
const d = (x) => (x ? new Date(x).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never');
const Table = ({ title, cols, rows }) => (
  <section><h2 className="font-display mb-3 text-xl font-bold">{title}</h2>
    <div className="max-h-96 overflow-auto rounded-3xl bg-white shadow-sm"><table className="w-full text-left text-sm">
      <thead className="sticky top-0 bg-white text-soft"><tr>{cols.map((c) => <th key={c} className="px-4 py-3 font-semibold">{c}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-lav">{r.map((c, j) => <td key={j} className="whitespace-nowrap px-4 py-2.5">{c}</td>)}</tr>)}</tbody></table></div></section>);
export default function Admin() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { if (user.role === 'admin') api.get('/admin/overview').then((r) => setData(r.data.data)).catch((e) => setErr(errMsg(e))); }, []);
  if (user.role !== 'admin') return <p className="text-soft">This page is for admins only.</p>;
  if (err) return <p role="alert" className="text-rose-700">{err}</p>;
  if (!data) return <Skeletons n={3} />;
  const c = data.counts, max = Math.max(1, ...data.skillsByCategory.map((x) => x.count));
  const stats = [[Users, 'Students', c.users], [Activity, 'Logged in (24h)', c.active24h], [Sparkles, 'Skills shared', c.skills], [Repeat2, 'Exchange requests', c.requests], [MessageSquare, 'Messages', c.messages], [Star, `Ratings (avg ${c.avgRating.toFixed(1)})`, c.ratings]];
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-extrabold">Admin dashboard</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{stats.map(([Icon, label, n]) => (
        <div key={label} className="rounded-3xl bg-white p-4 shadow-sm"><Icon className="size-5 text-violet" /><p className="font-display mt-2 text-3xl font-extrabold">{n}</p><p className="text-xs text-soft">{label}</p></div>))}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-5 shadow-sm"><h2 className="font-display mb-3 text-lg font-bold">Requests by status</h2>
          <div className="flex flex-wrap gap-3">{['pending', 'accepted', 'rejected', 'cancelled'].map((s) => <span key={s} className="flex items-center gap-2"><StatusBadge status={s} /><b>{data.requestsByStatus[s] || 0}</b></span>)}</div></section>
        <section className="rounded-3xl bg-white p-5 shadow-sm"><h2 className="font-display mb-3 text-lg font-bold">Skills by category</h2>
          <div className="space-y-1.5">{data.skillsByCategory.map((x) => <div key={x.category} className="flex items-center gap-2 text-xs"><span className="w-24 shrink-0">{x.category}</span><div className="h-2.5 rounded-full bg-volt" style={{ width: `${(x.count / max) * 100}%` }} /><b>{x.count}</b></div>)}</div></section>
      </div>
      <Table title="Students and logins" cols={['Name', 'Email', 'Joined', 'Last login', 'Logins', 'Skills shared']} rows={data.users.map((u) => [<>{u.name}{u.role === 'admin' && <span className="ml-2"><Tag>Admin</Tag></span>}</>, u.email, d(u.createdAt), d(u.lastLoginAt), u.loginCount, u.skillCount])} />
      <Table title="Latest skills shared" cols={['Skill', 'Teacher', 'Category', 'Level', 'Shared']} rows={data.skills.map((s) => [s.title, s.owner?.name, s.category, <LevelBadge level={s.level} />, d(s.createdAt)])} />
      <Table title="Latest exchange requests" cols={['From', 'To', 'Wants to learn', 'Status', 'Sent']} rows={data.requests.map((r) => [r.sender?.name, r.recipient?.name, r.requestedSkill?.title, <StatusBadge status={r.status} />, d(r.createdAt)])} />
      <Table title="Top rated teachers (2+ ratings)" cols={['Teacher', 'Rating', 'Reviews']} rows={data.topTeachers.map((t) => [t.name, <span className="flex items-center gap-2"><Stars value={t.avg} size={14} />{t.avg.toFixed(1)}</span>, t.count])} />
    </div>);
}
