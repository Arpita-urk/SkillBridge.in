import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errMsg } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar, Button, Field, LevelBadge, Tag, Skeletons, Stars } from '../components/ui.jsx';
export default function Profile() {
  const { id } = useParams();
  const { user, setUser, notify } = useAuth();
  const own = !id || id === user.id;
  const [p, setP] = useState(null);
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    setP(null); setErr('');
    api.get(`/users/${own ? user.id : id}`).then((r) => { setP(r.data.data); setF({ name: r.data.data.name, bio: r.data.data.bio, avatar: r.data.data.avatar, wantToLearn: r.data.data.wantToLearn.join(', ') }); }).catch((e) => setErr(errMsg(e)));
  }, [id]);
  const save = async (e) => {
    e.preventDefault();
    if (f.name.trim().length < 2) return setErr('Name must be at least 2 characters');
    setBusy(true); setErr('');
    try {
      const r = await api.put('/users/me', { ...f, wantToLearn: f.wantToLearn.split(',') });
      setUser(r.data.data); setP({ ...p, ...r.data.data }); notify('Profile saved');
    } catch (e2) { setErr(errMsg(e2)); } finally { setBusy(false); }
  };
  if (err && !p) return <p role="alert" className="text-rose-700">{err}</p>;
  if (!p) return <Skeletons n={2} />;
  const set = (e) => setF({ ...f, [e.target.name]: e.target.value });
  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center gap-5 rounded-3xl bg-white p-6 shadow-sm">
        <Avatar user={p} size={80} />
        <div><h1 className="font-display text-3xl font-extrabold">{p.name}</h1><p className="text-sm text-soft">Joined {new Date(p.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
          <p className="mt-2 max-w-xl text-sm">{p.bio || (own ? 'Add a short bio so people know who you are.' : 'No bio yet.')}</p></div>
      </section>
      <section><h2 className="font-display text-xl font-bold mb-3">Can teach</h2>
        {p.skills.length ? <div className="grid gap-3 sm:grid-cols-2">{p.skills.map((s) => <div key={s._id} className="rounded-2xl bg-white p-4"><p className="font-semibold">{s.title}</p><div className="mt-2 flex gap-2"><Tag>{s.category}</Tag><LevelBadge level={s.level} /></div></div>)}</div> : <p className="text-sm text-soft">Nothing shared yet.</p>}</section>
      <section><h2 className="font-display text-xl font-bold mb-3">Wants to learn</h2>
        {p.wantToLearn.length ? <div className="flex flex-wrap gap-2">{p.wantToLearn.map((w) => <Tag key={w}>{w}</Tag>)}</div> : <p className="text-sm text-soft">Nothing listed yet.</p>}</section>
      <section><h2 className="font-display mb-3 text-xl font-bold">Teaching ratings</h2>
        {p.rating?.count ? (<div>
          <p className="flex items-center gap-2"><Stars value={p.rating.avg} size={22} /><b className="text-lg">{p.rating.avg.toFixed(1)}</b><span className="text-sm text-soft">from {p.rating.count} student{p.rating.count > 1 ? 's' : ''}</span></p>
          <ul className="mt-3 space-y-2">{p.rating.reviews.map((r) => (<li key={r._id} className="rounded-2xl bg-white p-4"><div className="flex flex-wrap items-center gap-2"><Avatar user={r.rater} size={24} /><span className="text-sm font-semibold">{r.rater?.name}</span><Stars value={r.stars} size={14} />{r.skillTitle && <Tag>{r.skillTitle}</Tag>}</div>{r.comment && <p className="mt-2 text-sm text-soft">“{r.comment}”</p>}</li>))}</ul></div>
        ) : <p className="text-sm text-soft">No ratings yet. They appear after students finish an exchange.</p>}</section>
      {own && f && (
        <form onSubmit={save} className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold">Edit profile</h2>
          {err && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{err}</p>}
          <Field label="Name" name="name" value={f.name} onChange={set} maxLength={60} />
          <Field label="Bio" as="textarea" rows={3} name="bio" value={f.bio} onChange={set} maxLength={300} />
          <Field label="Avatar image link (https)" name="avatar" value={f.avatar} onChange={set} placeholder="https://…" />
          <Field label="Skills you want to learn (comma separated)" name="wantToLearn" value={f.wantToLearn} onChange={set} />
          <Button type="submit" loading={busy}>Save profile</Button>
        </form>)}
    </div>);
}
